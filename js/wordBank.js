/**
 * Words Memory - 单词库管理模块
 */

// 单词库数据结构
class WordBank {
    constructor() {
        this.wordLists = [];
        this.loadFromStorage();
    }

    // 从本地存储加载数据
    loadFromStorage() {
        const storedData = localStorage.getItem('wordsMemoryWordBank');
        if (storedData) {
            try {
                this.wordLists = JSON.parse(storedData);
            } catch (error) {
                console.error('解析单词库数据时出错:', error);
                this.wordLists = [];
            }
        }

        // 初始化时如果没有默认单词库，创建示例单词库
        if (this.wordLists.length === 0) {
            this.createDefaultWordLists();
        }
    }

    // 保存到本地存储
    saveToStorage() {
        localStorage.setItem('wordsMemoryWordBank', JSON.stringify(this.wordLists));
    }

    // 创建默认单词库
    createDefaultWordLists() {
        // 初级英语示例
        const basicEnglishList = {
            id: 'list_' + Math.random().toString(36).substr(2, 9),
            name: '初级英语',
            description: '包含1000个最常用的英语单词',
            words: this.getBasicEnglishWords(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ['英语', '基础', '入门']
        };

        // 商务英语示例
        const businessEnglishList = {
            id: 'list_' + Math.random().toString(36).substr(2, 9),
            name: '商务英语',
            description: '商务沟通中常用的英语词汇',
            words: this.getBusinessEnglishWords(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ['英语', '商务', '职场']
        };

        this.wordLists.push(basicEnglishList, businessEnglishList);
        this.saveToStorage();
    }

    // 获取基础英语单词示例
    getBasicEnglishWords() {
        return [
            {
                id: 'word_' + Math.random().toString(36).substr(2, 9),
                word: 'Eloquent',
                meaning: '雄辩的，有说服力的',
                phonetic: '/ˈeləkwənt/',
                examples: ['She gave an eloquent speech.'],
                tags: ['adj', '性格'],
                memoryStatus: {
                    level: 0,
                    nextReview: new Date().toISOString(),
                    reviewHistory: []
                }
            },
            {
                id: 'word_' + Math.random().toString(36).substr(2, 9),
                word: 'Serendipity',
                meaning: '意外发现美好事物',
                phonetic: '/ˌserənˈdɪpɪti/',
                examples: ['They found each other by serendipity.'],
                tags: ['n', '生活'],
                memoryStatus: {
                    level: 0,
                    nextReview: new Date().toISOString(),
                    reviewHistory: []
                }
            },
            // 更多单词...
        ];
    }

    // 获取商务英语单词示例
    getBusinessEnglishWords() {
        return [
            {
                id: 'word_' + Math.random().toString(36).substr(2, 9),
                word: 'Negotiate',
                meaning: '谈判，协商',
                phonetic: '/nɪˈɡoʊʃieɪt/',
                examples: ['We need to negotiate the terms of the contract.'],
                tags: ['v', '商务'],
                memoryStatus: {
                    level: 0,
                    nextReview: new Date().toISOString(),
                    reviewHistory: []
                }
            },
            {
                id: 'word_' + Math.random().toString(36).substr(2, 9),
                word: 'Revenue',
                meaning: '收入，营收',
                phonetic: '/ˈrevəˌnu/',
                examples: ['The company reported increased revenue this quarter.'],
                tags: ['n', '财务'],
                memoryStatus: {
                    level: 0,
                    nextReview: new Date().toISOString(),
                    reviewHistory: []
                }
            },
            // 更多单词...
        ];
    }

    // 获取所有单词列表
    getAllWordLists() {
        return this.wordLists;
    }

    // 根据ID获取单词列表
    getWordListById(listId) {
        return this.wordLists.find(list => list.id === listId);
    }

    // 添加新的单词列表
    addWordList(name, description, tags = []) {
        const newList = {
            id: 'list_' + Math.random().toString(36).substr(2, 9),
            name,
            description,
            words: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags
        };

        this.wordLists.push(newList);
        this.saveToStorage();
        return newList;
    }

    // 编辑单词列表
    editWordList(listId, updates) {
        const listIndex = this.wordLists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
            this.wordLists[listIndex] = {
                ...this.wordLists[listIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // 删除单词列表
    deleteWordList(listId) {
        const initialLength = this.wordLists.length;
        this.wordLists = this.wordLists.filter(list => list.id !== listId);
        
        if (this.wordLists.length !== initialLength) {
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // 向列表添加单词
    addWordToList(listId, wordData) {
        const list = this.getWordListById(listId);
        if (list) {
            const newWord = {
                id: 'word_' + Math.random().toString(36).substr(2, 9),
                ...wordData,
                memoryStatus: {
                    level: 0,
                    nextReview: new Date().toISOString(),
                    reviewHistory: []
                }
            };

            list.words.push(newWord);
            list.updatedAt = new Date().toISOString();
            this.saveToStorage();
            return newWord;
        }
        return null;
    }

    // 编辑单词
    editWord(listId, wordId, updates) {
        const list = this.getWordListById(listId);
        if (list) {
            const wordIndex = list.words.findIndex(word => word.id === wordId);
            if (wordIndex !== -1) {
                list.words[wordIndex] = {
                    ...list.words[wordIndex],
                    ...updates
                };
                list.updatedAt = new Date().toISOString();
                this.saveToStorage();
                return true;
            }
        }
        return false;
    }

    // 删除单词
    deleteWord(listId, wordId) {
        const list = this.getWordListById(listId);
        if (list) {
            const initialLength = list.words.length;
            list.words = list.words.filter(word => word.id !== wordId);
            
            if (list.words.length !== initialLength) {
                list.updatedAt = new Date().toISOString();
                this.saveToStorage();
                return true;
            }
        }
        return false;
    }

    // 获取需要复习的单词
    getWordsForReview() {
        const now = new Date();
        const reviewWords = [];

        this.wordLists.forEach(list => {
            list.words.forEach(word => {
                const nextReview = new Date(word.memoryStatus.nextReview);
                if (nextReview <= now && word.memoryStatus.level < 5) {
                    reviewWords.push({
                        ...word,
                        listId: list.id,
                        listName: list.name
                    });
                }
            });
        });

        return reviewWords;
    }

    // 导入单词列表
    importWordList(data) {
        try {
            const importedList = JSON.parse(data);
            if (importedList.name && Array.isArray(importedList.words)) {
                const newList = {
                    id: 'list_' + Math.random().toString(36).substr(2, 9),
                    name: importedList.name,
                    description: importedList.description || '',
                    words: importedList.words.map(word => ({
                        ...word,
                        id: 'word_' + Math.random().toString(36).substr(2, 9),
                        memoryStatus: {
                            level: 0,
                            nextReview: new Date().toISOString(),
                            reviewHistory: []
                        }
                    })),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    tags: importedList.tags || []
                };

                this.wordLists.push(newList);
                this.saveToStorage();
                return newList;
            }
        } catch (error) {
            console.error('导入单词列表时出错:', error);
        }
        return null;
    }

    // 导出单词列表
    exportWordList(listId) {
        const list = this.getWordListById(listId);
        if (list) {
            return JSON.stringify({
                name: list.name,
                description: list.description,
                words: list.words.map(word => ({
                    word: word.word,
                    meaning: word.meaning,
                    phonetic: word.phonetic,
                    examples: word.examples,
                    tags: word.tags
                })),
                tags: list.tags
            });
        }
        return null;
    }
}

// 初始化单词库管理
const wordBankManager = new WordBank();

// 导出公共接口
window.WordsMemoryWordBank = wordBankManager;

// 欧路词典API集成
class EudictAPI {
    constructor() {
        this.baseUrl = 'https://api.frdic.com/api/open/v1';
        this.language = 'en';
        this.authToken = 'NIS WF3vqZU9ZfQCVbL18REXwy/knJpDBcGjr2rWEoO34L6Yp7NFxjRbcQ==';
    }
    
    /**
     * 获取生词本中的单词
     * @param {string} id - 课本ID，默认0表示全部生词本
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise} 返回Promise对象
     */
    async getStudyListWords(id = '0', page = 1, pageSize = 10) {
        try {
            // 构建API URL
            const url = `${this.baseUrl}/studylist/words/${id}?language=${this.language}`;
            
            // 检查是否在开发环境 - 如果是，使用模拟数据
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
                console.log('使用实际API请求欧路词典数据');
                
                // 使用fetch API调用
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.49 Safari/537.36',
                        'Authorization': this.authToken,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`获取单词列表失败: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } else {
                // 生产环境：实际API调用
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.49 Safari/537.36',
                        'Authorization': this.authToken,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`获取单词列表失败: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            }
        } catch (error) {
            console.error('获取生词本单词失败:', error);
            
            // 即使在生产环境出错时也返回模拟数据，确保UI可用
            return {
                data: this.getMockWords(page, pageSize),
                total_pages: 10,
                message: error.message || '获取生词失败，使用模拟数据'
            };
        }
    }
    
    /**
     * 获取所有生词本分类
     * @returns {Promise} 返回Promise对象
     */
    async getCategories() {
        try {
            // 构建API URL
            const url = `${this.baseUrl}/studylist/category?language=${this.language}`;
            
            // 检查是否在开发环境
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
                // 模拟延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 返回模拟数据
                return {
                    data: [
                        { id: '0', name: '所有生词' },
                        { id: '1', name: '课本一', count: 120 },
                        { id: '2', name: '课本二', count: 85 }
                    ],
                    message: ""
                };
            } else {
                // 实际API调用
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Authorization': this.authToken,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`获取生词本分类失败: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            }
        } catch (error) {
            console.error('获取生词本分类失败:', error);
            
            // 返回模拟数据，确保UI可用
            return {
                data: [
                    { id: '0', name: '所有生词' },
                    { id: '1', name: '课本一', count: 120 },
                    { id: '2', name: '课本二', count: 85 }
                ],
                message: error.message || '获取分类失败，使用模拟数据'
            };
        }
    }
    
    /**
     * 生成模拟单词数据（用于演示）
     */
    getMockWords(page, pageSize) {
        const mockWordsData = [
            {
                word: "Eloquent",
                exp: "adj. 流利的，雄辩的，有说服力的",
                add_time: "2023-05-15T10:23:29Z",
                star: 1,
                context_line: "She gave an eloquent speech that moved the audience."
            },
            {
                word: "Meticulous",
                exp: "adj. 一丝不苟的，极其谨慎的",
                add_time: "2023-05-16T14:45:22Z",
                star: 2,
                context_line: "He is meticulous about keeping records."
            },
            {
                word: "Benevolent",
                exp: "adj. 仁慈的，乐善好施的",
                add_time: "2023-05-17T09:12:45Z",
                star: 1,
                context_line: "The benevolent donor gave millions to charity."
            },
            {
                word: "Ephemeral",
                exp: "adj. 短暂的，瞬间的",
                add_time: "2023-05-18T16:36:42Z",
                star: 3,
                context_line: "The beauty of cherry blossoms is ephemeral, lasting only a few days."
            },
            {
                word: "Ubiquitous",
                exp: "adj. 无所不在的，普遍存在的",
                add_time: "2023-05-19T08:21:15Z",
                star: 2,
                context_line: "Smartphones have become ubiquitous in modern society."
            },
            {
                word: "Serendipity",
                exp: "n. 意外发现的才能，机缘巧合",
                add_time: "2023-05-20T11:14:33Z",
                star: 2,
                context_line: "Finding my dream job was pure serendipity."
            },
            {
                word: "Quintessential",
                exp: "adj. 典型的，精髓的，本质的",
                add_time: "2023-05-21T14:55:08Z",
                star: 3,
                context_line: "This restaurant offers the quintessential French dining experience."
            },
            {
                word: "Juxtapose",
                exp: "v. 并置，并列",
                add_time: "2023-05-22T09:47:21Z",
                star: 2,
                context_line: "The artist juxtaposes bright colors with dark shadows to create contrast."
            },
            {
                word: "Pernicious",
                exp: "adj. 有害的，恶性的",
                add_time: "2023-05-23T15:33:42Z",
                star: 1,
                context_line: "The pernicious effects of pollution can last for generations."
            },
            {
                word: "Esoteric",
                exp: "adj. 深奥的，难解的，只有内行才明白的",
                add_time: "2023-05-24T16:28:55Z",
                star: 3,
                context_line: "The professor's lecture was full of esoteric terms that confused the students."
            }
        ];
        
        // 根据页码和每页数量生成不同的单词数据
        const offset = (page - 1) * pageSize;
        return mockWordsData.slice(offset, offset + pageSize);
    }
    
    /**
     * 将欧路词典API返回的单词添加到本地单词库
     */
    addWordsToLocalWordBank(words, wordBank, listId) {
        if (!words || words.length === 0) return false;
        
        words.forEach(word => {
            const wordData = {
                word: word.word,
                meaning: word.exp,
                phonetic: "", // 欧路API中可能没有音标
                examples: [word.context_line],
                tags: [],
                memoryStatus: {
                    level: 0,
                    nextReview: new Date().toISOString(),
                    reviewHistory: []
                }
            };
            
            wordBank.addWordToList(listId, wordData);
        });
        
        return true;
    }
}

// 初始化欧路词典API
const eudictAPI = new EudictAPI();

// 导出欧路词典API
window.WordsMemoryEudictAPI = eudictAPI; 