/**
 * Words Memory - 记忆系统模块
 * 基于艾宾浩斯遗忘曲线的记忆算法
 */

// 记忆级别间隔（单位：分钟）
const MEMORY_INTERVALS = [
    25,           // 级别0 -> 级别1：25分钟后复习
    120,          // 级别1 -> 级别2：2小时后复习
    720,          // 级别2 -> 级别3：12小时后复习
    1440,         // 级别3 -> 级别4：1天后复习
    4320,         // 级别4 -> 级别5：3天后复习
    10080,        // 级别5 -> 级别6：7天后复习
    30240,        // 级别6 -> 级别7：21天后复习
    129600        // 级别7 -> 级别8：90天后复习
];

// 记忆结果评分
const MEMORY_RESULTS = {
    HARD: 'hard',       // 困难
    NORMAL: 'normal',   // 一般
    EASY: 'easy',       // 简单
    KNOWN: 'known'      // 已掌握
};

class MemorySystem {
    constructor() {
        this.wordBank = window.WordsMemoryWordBank;
        this.currentLearningSession = null;
    }

    // 开始学习会话
    startLearningSession(listId, dailyGoal = 20) {
        const wordList = this.wordBank.getWordListById(listId);
        if (!wordList) return null;

        // 获取需要学习的单词
        const newWords = wordList.words.filter(word => word.memoryStatus.level === 0);
        
        // 限制新单词数量为每日目标
        const sessionWords = newWords.slice(0, dailyGoal);
        
        this.currentLearningSession = {
            listId,
            listName: wordList.name,
            words: sessionWords,
            currentIndex: 0,
            startTime: new Date(),
            stats: {
                totalWords: sessionWords.length,
                learned: 0,
                hardWords: 0,
                normalWords: 0,
                easyWords: 0,
                knownWords: 0
            }
        };

        return this.currentLearningSession;
    }

    // 开始复习会话
    startReviewSession(maxWords = 50) {
        // 获取所有需要复习的单词
        const wordsForReview = this.wordBank.getWordsForReview();
        
        // 限制复习单词数量
        const sessionWords = wordsForReview.slice(0, maxWords);
        
        this.currentLearningSession = {
            isReview: true,
            words: sessionWords,
            currentIndex: 0,
            startTime: new Date(),
            stats: {
                totalWords: sessionWords.length,
                remembered: 0,
                forgotten: 0,
                levelUp: 0,
                levelDown: 0
            }
        };

        return this.currentLearningSession;
    }

    // 获取当前单词
    getCurrentWord() {
        if (!this.currentLearningSession) return null;
        
        const { words, currentIndex } = this.currentLearningSession;
        if (currentIndex >= words.length) return null;
        
        return words[currentIndex];
    }

    // 获取下一个单词
    getNextWord() {
        if (!this.currentLearningSession) return null;
        
        this.currentLearningSession.currentIndex++;
        return this.getCurrentWord();
    }

    // 处理记忆结果
    processMemoryResult(result) {
        if (!this.currentLearningSession) return null;
        
        const currentWord = this.getCurrentWord();
        if (!currentWord) return null;
        
        const { isReview } = this.currentLearningSession;
        const { stats } = this.currentLearningSession;
        
        // 更新记忆状态
        const updatedWord = { ...currentWord };
        const memoryStatus = { ...updatedWord.memoryStatus };
        const now = new Date();
        
        // 记录本次复习
        memoryStatus.reviewHistory.push({
            timestamp: now.toISOString(),
            result
        });
        
        // 根据结果更新级别和下次复习时间
        if (isReview) {
            // 复习模式
            switch (result) {
                case MEMORY_RESULTS.HARD:
                    // 困难：级别下降，但不低于1级
                    memoryStatus.level = Math.max(1, memoryStatus.level - 1);
                    stats.forgotten++;
                    stats.levelDown++;
                    break;
                case MEMORY_RESULTS.NORMAL:
                    // 一般：级别保持不变
                    stats.remembered++;
                    break;
                case MEMORY_RESULTS.EASY:
                    // 简单：级别上升
                    memoryStatus.level++;
                    stats.remembered++;
                    stats.levelUp++;
                    break;
                case MEMORY_RESULTS.KNOWN:
                    // 已掌握：直接标记为掌握
                    memoryStatus.level = 8; // 最高级别，表示已掌握
                    stats.remembered++;
                    stats.levelUp++;
                    break;
            }
        } else {
            // 学习模式
            switch (result) {
                case MEMORY_RESULTS.HARD:
                    memoryStatus.level = 1;
                    stats.hardWords++;
                    break;
                case MEMORY_RESULTS.NORMAL:
                    memoryStatus.level = 1;
                    stats.normalWords++;
                    break;
                case MEMORY_RESULTS.EASY:
                    memoryStatus.level = 2;
                    stats.easyWords++;
                    break;
                case MEMORY_RESULTS.KNOWN:
                    memoryStatus.level = 8;
                    stats.knownWords++;
                    break;
            }
            stats.learned++;
        }
        
        // 计算下次复习时间
        const nextLevel = memoryStatus.level;
        if (nextLevel < 8) { // 8级表示完全掌握，不再复习
            const interval = MEMORY_INTERVALS[nextLevel - 1] || MEMORY_INTERVALS[0];
            const nextReviewDate = new Date(now.getTime() + interval * 60 * 1000);
            memoryStatus.nextReview = nextReviewDate.toISOString();
        } else {
            // 已掌握的单词设置一个很远的复习时间
            const farFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            memoryStatus.nextReview = farFuture.toISOString();
        }
        
        updatedWord.memoryStatus = memoryStatus;
        
        // 更新单词库中的单词状态
        if (isReview) {
            this.wordBank.editWord(updatedWord.listId, updatedWord.id, { memoryStatus });
        } else {
            this.wordBank.editWord(this.currentLearningSession.listId, currentWord.id, { memoryStatus });
        }
        
        // 获取下一个单词
        const nextWord = this.getNextWord();
        
        // 如果没有下一个单词，结束会话
        if (!nextWord) {
            this.endLearningSession();
        }
        
        return {
            updatedWord,
            nextWord,
            sessionStats: this.currentLearningSession ? this.currentLearningSession.stats : null,
            isSessionComplete: !nextWord
        };
    }

    // 结束学习会话
    endLearningSession() {
        if (!this.currentLearningSession) return null;
        
        const sessionResult = {
            ...this.currentLearningSession,
            endTime: new Date(),
            duration: (new Date() - this.currentLearningSession.startTime) / 1000 // 秒
        };
        
        this.currentLearningSession = null;
        
        // 更新用户统计数据
        this.updateUserStats(sessionResult);
        
        return sessionResult;
    }

    // 更新用户统计数据
    updateUserStats(sessionResult) {
        const userData = localStorage.getItem('wordsMemoryUser');
        if (!userData) return;
        
        try {
            const user = JSON.parse(userData);
            const { stats } = user;
            
            // 更新统计数据
            if (sessionResult.isReview) {
                // 复习会话
                stats.wordsReviewed = (stats.wordsReviewed || 0) + sessionResult.stats.totalWords;
                stats.wordsRemembered = (stats.wordsRemembered || 0) + sessionResult.stats.remembered;
            } else {
                // 学习会话
                stats.wordsLearned = (stats.wordsLearned || 0) + sessionResult.stats.learned;
                stats.wordsMastered = (stats.wordsMastered || 0) + sessionResult.stats.knownWords;
            }
            
            // 更新连续学习天数
            const today = new Date().toISOString().split('T')[0];
            const lastActivity = new Date(stats.lastActivity).toISOString().split('T')[0];
            
            if (today !== lastActivity) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (lastActivity === yesterdayStr) {
                    // 连续学习
                    stats.streakDays++;
                } else {
                    // 中断后重新开始
                    stats.streakDays = 1;
                }
            }
            
            stats.lastActivity = new Date().toISOString();
            
            // 保存更新后的用户数据
            localStorage.setItem('wordsMemoryUser', JSON.stringify(user));
            
            return stats;
        } catch (error) {
            console.error('更新用户统计数据时出错:', error);
            return null;
        }
    }

    // 获取用户学习统计
    getUserStats() {
        const userData = localStorage.getItem('wordsMemoryUser');
        if (!userData) return null;
        
        try {
            const user = JSON.parse(userData);
            return user.stats;
        } catch (error) {
            console.error('获取用户统计数据时出错:', error);
            return null;
        }
    }

    // 获取今日学习目标进度
    getDailyProgress() {
        const stats = this.getUserStats();
        if (!stats) return { current: 0, goal: 50, percentage: 0 };
        
        const user = JSON.parse(localStorage.getItem('wordsMemoryUser'));
        const dailyGoal = user.preferences.dailyGoal || 50;
        
        // 检查今日学习的单词数
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = new Date(stats.lastActivity).toISOString().split('T')[0];
        
        let todayLearned = 0;
        if (today === lastActivity) {
            // 从会话历史中计算今日学习的单词数
            // 此处简化处理，实际应用中应该有更完善的会话历史记录
            todayLearned = stats.todayLearned || 0;
        }
        
        return {
            current: todayLearned,
            goal: dailyGoal,
            percentage: Math.min(100, Math.round((todayLearned / dailyGoal) * 100))
        };
    }
}

// 初始化记忆系统
const memorySystem = new MemorySystem();

// 导出公共接口
window.WordsMemoryMemorySystem = memorySystem; 