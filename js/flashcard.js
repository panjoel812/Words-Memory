/**
 * Words Memory - 单词卡片学习模块
 */

// 扩展应用命名空间
window.WordsMemoryApp = window.WordsMemoryApp || {};

// 单词卡片系统
window.WordsMemoryApp.FlashcardSystem = {
    currentWordList: null,    // 当前学习的单词列表
    words: [],                // 当前学习单词
    currentIndex: 0,          // 当前单词索引
    score: 0,                 // 当前得分
    totalQuestions: 0,        // 总题目数
    isFlipped: false,         // 卡片是否翻转
    studyMode: 'enToZh',       // enToZh: 英译中, zhToEn: 中译英
    isUsingEudict: false,     // 是否使用欧路词典
    eudictCategoryId: '0',    // 欧路词典分类ID，默认为0（所有单词）
    eudictAllWords: [],       // 从欧路词典获取的所有单词

    // 初始化闪卡系统
    init() {
        console.log('初始化单词卡片系统...');

        // 获取DOM元素
        this.flashcard = document.getElementById('flashcard');
        this.frontContent = document.getElementById('frontContent');
        this.btnNext = document.getElementById('btnNext');
        this.btnSkip = document.getElementById('btnSkip');
        this.currentQuestionEl = document.getElementById('currentQuestion');
        this.totalQuestionsEl = document.getElementById('totalQuestions');
        this.currentScoreEl = document.getElementById('currentScore');
        this.totalScoreEl = document.getElementById('totalScore');

        // 获取学习模式按钮
        this.modeEnToZhBtn = document.getElementById('modeEnToZh');
        this.modeZhToEnBtn = document.getElementById('modeZhToEn');

        // 绑定事件
        this.bindEvents();

        // 尝试从URL参数获取欧路词典设置
        this.checkEudictSettings();

        // 加载单词数据
        this.loadWords();
    },

    // 检查是否有欧路词典相关的URL参数
    checkEudictSettings() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('eudict') && urlParams.get('eudict') === 'true') {
            this.isUsingEudict = true;
            console.log('检测到欧路词典设置：启用');
            if (urlParams.has('category')) {
                this.eudictCategoryId = urlParams.get('category');
                console.log('欧路词典分类ID：', this.eudictCategoryId);
            }
        } else {
            console.log('未检测到欧路词典设置，将使用本地词库');
        }
    },

    // 绑定事件处理
    bindEvents() {
        // 卡片点击事件，实现翻转功能
        if (this.flashcard) {
            this.flashcard.addEventListener('click', () => this.flipCard());
        }

        // 下一个单词按钮
        if (this.btnNext) {
            this.btnNext.addEventListener('click', () => this.nextWord());
        }

        // 跳过单词按钮
        if (this.btnSkip) {
            this.btnSkip.addEventListener('click', () => this.skipWord());
        }

        // 绑定学习模式切换
        if (this.modeEnToZhBtn) {
            this.modeEnToZhBtn.addEventListener('click', () => this.setStudyMode('enToZh'));
        }
        if (this.modeZhToEnBtn) {
            this.modeZhToEnBtn.addEventListener('click', () => this.setStudyMode('zhToEn'));
        }
    },

    // 设置学习模式
    setStudyMode(mode) {
        console.log('切换学习模式为：', mode === 'enToZh' ? '英译中' : '中译英');
        this.studyMode = mode;
        
        // 更新按钮状态
        if (mode === 'enToZh') {
            this.modeEnToZhBtn.classList.add('mode-btn--active');
            this.modeZhToEnBtn.classList.remove('mode-btn--active');
        } else {
            this.modeEnToZhBtn.classList.remove('mode-btn--active');
            this.modeZhToEnBtn.classList.add('mode-btn--active');
        }
        
        // 重新开始学习
        this.restartLearning();
    },

    // 加载单词数据
    async loadWords() {
        if (this.isUsingEudict) {
            console.log('正在使用欧路词典获取单词...');
            await this.loadWordsFromEudict();
            return;
        }

        console.log('使用本地词库加载单词数据');
        // 否则使用本地单词库
        // 获取单词库中的单词
        const wordBank = window.WordsMemoryWordBank;
        if (!wordBank) {
            console.error('单词库未初始化');
            return;
        }

        // 获取所有单词列表
        const wordLists = wordBank.getAllWordLists();
        if (wordLists.length === 0) {
            console.error('单词列表为空');
            return;
        }

        // 选择第一个单词列表（可以改为UI选择）
        this.currentWordList = wordLists[0];
        console.log(`已选择词库: ${this.currentWordList.name}，共有${this.currentWordList.words.length}个单词`);
        
        // 随机选择10个单词
        this.words = this.getRandomWords(this.currentWordList.words, 10);
        this.totalQuestions = this.words.length;
        console.log(`本次随机抽取了${this.words.length}个单词进行学习`);
        
        // 更新统计信息
        this.updateStats();
        
        // 显示第一个单词
        this.showCurrentWord();
    },

    // 随机获取指定数量的单词
    getRandomWords(wordArray, count) {
        // 复制数组以避免修改原数组
        const shuffled = [...wordArray];
        
        // 随机打乱数组
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // 返回指定数量的单词
        return shuffled.slice(0, Math.min(count, shuffled.length));
    },

    // 修改HTML结构，适应新的正反面设计
    rebuildFlashcard() {
        const container = document.querySelector('.flashcard-container');
        
        if (!container) return;
        
        // 重新构建卡片结构
        container.innerHTML = `
            <div class="flashcard glass-effect" id="flashcard">
                <div class="flashcard__front">
                    <div class="flashcard__word" id="frontContent"></div>
                </div>
                <div class="flashcard__back">
                    <div class="flashcard__meaning">
                        <div class="flashcard__answer" id="backContent"></div>
                    </div>
                </div>
            </div>
            
            <div class="flashcard-nav">
                <button id="btnSkip" class="btn btn-secondary">跳过</button>
                <button id="btnNext" class="btn btn-primary">下一题</button>
            </div>
        `;
        
        // 重新获取DOM元素
        this.flashcard = document.getElementById('flashcard');
        this.frontContent = document.getElementById('frontContent');
        this.backContent = document.getElementById('backContent');
        this.btnNext = document.getElementById('btnNext');
        this.btnSkip = document.getElementById('btnSkip');
        
        // 重新绑定事件
        this.bindEvents();
    },

    // 显示当前单词
    showCurrentWord() {
        if (this.currentIndex >= this.words.length) {
            // 所有单词学习完毕
            this.showCompletionMessage();
            return;
        }

        // 确保卡片结构正确
        if (!document.getElementById('backContent')) {
            this.rebuildFlashcard();
        }

        // 获取当前单词
        const currentWord = this.words[this.currentIndex];
        
        // 重置卡片状态
        this.resetCard();
        
        // 根据学习模式设置正面和背面内容
        if (this.studyMode === 'enToZh') {
            // 英译中：正面显示英文，背面显示中文
            this.frontContent.textContent = currentWord.word;
            this.backContent.innerHTML = `
                <h3>中文释义</h3>
                <div class="answer">${currentWord.meaning}</div>
            `;
        } else {
            // 中译英：正面显示中文，背面显示英文
            this.frontContent.textContent = currentWord.meaning;
            this.backContent.innerHTML = `
                <h3>英文单词</h3>
                <div class="answer">${currentWord.word}</div>
            `;
        }

        // 更新进度指示
        this.currentQuestionEl.textContent = this.currentIndex + 1;
    },

    // 翻转卡片
    flipCard() {
        if (!this.isFlipped) {
            this.flashcard.classList.add('flipped');
            this.isFlipped = true;
        }
    },

    // 跳过当前单词
    skipWord() {
        this.nextWord();
    },

    // 下一个单词
    nextWord() {
        if (this.isFlipped) {
            // 记录已完成一个单词（如果已翻转）
            this.score++;
            this.currentScoreEl.textContent = this.score;
            
            // 更新当前单词的记忆状态
            if (this.currentWordList && !this.isUsingEudict) {
                const currentWord = this.words[this.currentIndex];
                currentWord.memoryStatus.level = 
                    Math.min(currentWord.memoryStatus.level + 1, 5);
                
                // 保存状态
                window.WordsMemoryWordBank?.saveToStorage();
            }
        }

        this.currentIndex++;
        this.updateStats();
        this.showCurrentWord();
    },

    // 重置卡片状态
    resetCard() {
        this.isFlipped = false;
        this.flashcard.classList.remove('flipped');
    },

    // 更新统计信息
    updateStats() {
        this.totalQuestionsEl.textContent = this.totalQuestions;
        this.totalScoreEl.textContent = this.totalQuestions;
        this.currentScoreEl.textContent = this.score;
    },

    // 显示学习完成消息
    showCompletionMessage() {
        // 创建完成消息
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message glass-effect';
        
        // 计算学习准确率百分比
        const accuracyPercent = Math.round((this.score / this.totalQuestions) * 100);
        
        // 根据准确率显示不同的消息
        let feedbackMessage = '';
        if (accuracyPercent >= 90) {
            feedbackMessage = '太棒了！你的表现非常出色！';
        } else if (accuracyPercent >= 70) {
            feedbackMessage = '做得好！继续努力！';
        } else if (accuracyPercent >= 50) {
            feedbackMessage = '不错的开始，再多练习一下吧！';
        } else {
            feedbackMessage = '继续加油，熟能生巧！';
        }
        
        completionMessage.innerHTML = `
            <h2>学习完成！</h2>
            <div class="completion-stats">
                <div class="completion-score">
                    <span class="score-number">${this.score}</span>
                    <span class="score-label">复习单词</span>
                </div>
                <div class="completion-accuracy">
                    <span class="accuracy-number">${accuracyPercent}%</span>
                    <span class="accuracy-label">完成率</span>
                </div>
            </div>
            <p class="feedback-message">${feedbackMessage}</p>
            <div class="completion-actions">
                <button class="btn btn-primary" id="restartBtn">再学一次</button>
                <a href="../index.html" class="btn btn-secondary">返回首页</a>
            </div>
        `;
        
        // 替换卡片容器内容
        const container = document.querySelector('.flashcard-container');
        container.innerHTML = '';
        container.appendChild(completionMessage);
        
        // 绑定重新开始按钮事件
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartLearning();
        });
    },

    // 重新开始学习
    restartLearning() {
        // 重置状态
        this.currentIndex = 0;
        this.score = 0;
        
        // 确保卡片结构正确
        this.rebuildFlashcard();
        
        // 重新加载单词
        if (this.isUsingEudict) {
            // 如果已经获取了词库单词，直接随机选择10个
            if (this.eudictAllWords.length > 10) {
                this.words = this.getRandomWords(this.eudictAllWords, 10);
                this.totalQuestions = this.words.length;
                this.updateStats();
                this.showCurrentWord();
            } else {
                // 重新从欧路词典加载单词
                this.loadWordsFromEudict();
            }
        } else {
            // 重新加载本地单词
            this.loadWords();
        }
    },

    // 从欧路词典加载单词
    async loadWordsFromEudict() {
        try {
            // 显示加载中
            if (this.frontContent) {
                this.frontContent.textContent = "加载中...";
            }
            
            // 获取欧路词典API
            const eudictAPI = window.WordsMemoryEudictAPI;
            if (!eudictAPI) {
                throw new Error('欧路词典API未初始化');
            }
            
            // 如果已经有欧路词典词库，则直接使用
            if (this.eudictAllWords.length > 0) {
                console.log('使用已缓存的欧路词典数据');
                this.words = this.getRandomWords(this.eudictAllWords, 10);
                this.totalQuestions = this.words.length;
                this.updateStats();
                this.showCurrentWord();
                return;
            }
            
            console.log('从欧路词典API获取单词数据...');
            // 获取单词列表
            const response = await eudictAPI.getStudyListWords(
                this.eudictCategoryId, 
                1,  // 页码
                50  // 数量 - 获取更多单词作为词库
            );
            
            if (!response || !response.data || response.data.length === 0) {
                throw new Error('未找到单词数据');
            }
            
            console.log(`从欧路词典获取了${response.data.length}个单词`);
            
            // 转换为适合学习的格式
            this.eudictAllWords = response.data.map(item => ({
                id: 'eudict_' + Math.random().toString(36).substr(2, 9),
                word: item.word,
                meaning: item.exp.replace(/^[\w\.]+\.\s+/, ''), // 去掉词性标记
                phonetic: '',
                examples: [item.context_line || ''],
                tags: [],
                memoryStatus: {
                    level: 0,
                    nextReview: new Date().toISOString(),
                    reviewHistory: []
                }
            }));
            
            // 随机选择10个作为本次学习内容
            this.words = this.getRandomWords(this.eudictAllWords, 10);
            this.totalQuestions = this.words.length;
            
            // 创建临时单词列表对象
            this.currentWordList = {
                id: 'eudict_temp',
                name: '欧路词典单词',
                words: this.eudictAllWords
            };
            
            // 更新统计信息
            this.updateStats();
            
            // 显示第一个单词
            this.showCurrentWord();
            
        } catch (error) {
            console.error('从欧路词典加载单词失败:', error);
            
            // 显示错误信息
            if (this.frontContent) {
                this.frontContent.textContent = "加载单词失败";
            }
            
            // 回退到使用本地单词库
            this.isUsingEudict = false;
            setTimeout(() => this.loadWords(), 1500);
        }
    },

    // 获取欧路词典中的所有分类
    async getAllCategories() {
        try {
            const eudictAPI = window.WordsMemoryEudictAPI;
            if (!eudictAPI) {
                throw new Error('欧路词典API未初始化');
            }
            
            // 直接使用欧路词典API获取分类
            const response = await eudictAPI.getCategories();
            if (!response || !response.data) {
                throw new Error('获取欧路词典分类失败');
            }
            
            // 返回分类数据
            return response.data;
        } catch (error) {
            console.error('获取欧路词典分类失败:', error);
            return [];
        }
    },
    
    // 从特定分类获取单词
    async getWordsFromCategory(categoryId, page = 1, pageSize = 100) {
        try {
            const eudictAPI = window.WordsMemoryEudictAPI;
            if (!eudictAPI) {
                throw new Error('欧路词典API未初始化');
            }
            
            // 直接使用欧路词典API获取单词
            return await eudictAPI.getStudyListWords(categoryId, page, pageSize);
        } catch (error) {
            console.error('从分类获取单词失败:', error);
            return { data: [], total_pages: 0 };
        }
    }
};

// 初始化函数
window.WordsMemoryApp.initFlashcards = function() {
    const flashcardSystem = window.WordsMemoryApp.FlashcardSystem;
    flashcardSystem.init();
}; 