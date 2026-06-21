/**
 * Words Memory - UI交互模块
 */

// UI工具类
class UI {
    constructor() {
        this.wordCardTemplate = document.getElementById('wordCardTemplate');
        this.mainContent = document.getElementById('mainContent');
        this.app = window.WordsMemoryApp;
        this.wordBank = window.WordsMemoryWordBank;
        this.memorySystem = window.WordsMemoryMemorySystem;
        this.eudictAPI = window.WordsMemoryEudictAPI;
        
        // 绑定UI事件
        this.bindEvents();
        
        // 初始化UI组件
        this.initComponents();
    }

    // 绑定UI事件
    bindEvents() {
        // 单词卡片翻转
        document.addEventListener('click', (event) => {
            const wordCard = event.target.closest('.word-card');
            if (wordCard && !event.target.closest('.memory-buttons')) {
                wordCard.classList.toggle('flipped');
            }
        });
        
        // 记忆按钮点击
        document.addEventListener('click', (event) => {
            const memoryBtn = event.target.closest('.memory-btn');
            if (memoryBtn) {
                this.handleMemoryButtonClick(memoryBtn);
            }
        });
        
        // 学习计划按钮点击
        document.addEventListener('click', (event) => {
            const studyButton = event.target.closest('.activity-footer .btn');
            if (studyButton) {
                const activityItem = studyButton.closest('.activity-item');
                if (activityItem) {
                    this.handleStudyButtonClick(activityItem);
                }
            }
        });
        
        // 单词发音按钮
        document.addEventListener('click', (event) => {
            if (event.target.closest('.memory-btn.memory-audio')) {
                this.handleAudioButtonClick(event.target.closest('.study-word-card'));
            }
        });
        
        // 标记为已学按钮
        document.addEventListener('click', (event) => {
            if (event.target.closest('.memory-btn.memory-known')) {
                this.handleMarkAsLearnedClick(event.target.closest('.study-word-card'));
            }
        });
        
        // 学习页面搜索框
        const studySearchInput = document.querySelector('.study-search input');
        if (studySearchInput) {
            studySearchInput.addEventListener('input', (event) => {
                this.handleStudySearch(event.target.value);
            });
        }
    }

    // 初始化UI组件
    initComponents() {
        // 检查是否有正在进行的学习会话
        this.checkActiveLearningSession();
    }

    // 处理记忆按钮点击
    handleMemoryButtonClick(button) {
        let result;
        
        if (button.classList.contains('memory-hard')) {
            result = 'hard';
        } else if (button.classList.contains('memory-normal')) {
            result = 'normal';
        } else if (button.classList.contains('memory-easy')) {
            result = 'easy';
        } else if (button.classList.contains('memory-known')) {
            result = 'known';
        }
        
        if (result) {
            const response = this.memorySystem.processMemoryResult(result);
            
            if (response) {
                if (response.nextWord) {
                    // 显示下一个单词
                    this.showWordCard(response.nextWord);
                } else {
                    // 会话完成
                    this.showSessionComplete(response.sessionStats);
                }
            }
        }
    }

    // 处理学习计划按钮点击
    handleStudyButtonClick(activityItem) {
        const listName = activityItem.querySelector('h4').textContent;
        const wordLists = this.wordBank.getAllWordLists();
        const targetList = wordLists.find(list => list.name === listName);
        
        if (targetList) {
            const session = this.memorySystem.startLearningSession(targetList.id);
            if (session) {
                this.showWordCard(session.words[0]);
            }
        }
    }

    // 显示单词卡片
    showWordCard(word) {
        if (!word) return;
        
        // 创建单词卡片元素
        const cardContainer = document.createElement('div');
        cardContainer.className = 'word-study-container';
        
        cardContainer.innerHTML = `
            <h2 class="page-title">单词学习</h2>
            <div class="word-progress">
                <div class="progress-text">
                    进度: ${this.memorySystem.currentLearningSession.currentIndex + 1} / ${this.memorySystem.currentLearningSession.words.length}
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${((this.memorySystem.currentLearningSession.currentIndex + 1) / this.memorySystem.currentLearningSession.words.length) * 100}%"></div>
                </div>
            </div>
            <div class="word-card glass-effect">
                <div class="word-card-front">
                    <div class="word-text">${word.word}</div>
                    <div class="word-phonetic">${word.phonetic || ''}</div>
                    <div class="word-instruction">(点击卡片查看释义)</div>
                </div>
                <div class="word-card-back">
                    <div class="word-definition">${word.meaning}</div>
                    <div class="word-example">${word.examples ? word.examples[0] : ''}</div>
                    <div class="memory-buttons">
                        <button class="memory-btn memory-hard">困难</button>
                        <button class="memory-btn memory-normal">一般</button>
                        <button class="memory-btn memory-easy">简单</button>
                        <button class="memory-btn memory-known">已掌握</button>
                    </div>
                </div>
            </div>
            <div class="study-actions">
                <button class="btn btn-secondary" id="endStudyBtn">结束学习</button>
            </div>
        `;
        
        // 清除主内容区域
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(cardContainer);
        
        // 绑定结束学习按钮
        const endStudyBtn = document.getElementById('endStudyBtn');
        if (endStudyBtn) {
            endStudyBtn.addEventListener('click', () => {
                this.endStudySession();
            });
        }
    }

    // 显示会话完成页面
    showSessionComplete(stats) {
        const sessionResult = this.memorySystem.endLearningSession();
        
        const sessionCompleteContainer = document.createElement('div');
        sessionCompleteContainer.className = 'session-complete-container';
        
        // 计算学习时间
        const duration = sessionResult.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const timeString = `${minutes}分${seconds}秒`;
        
        sessionCompleteContainer.innerHTML = `
            <div class="session-complete glass-effect">
                <h2>学习完成!</h2>
                <div class="session-stats">
                    <div class="stat-item">
                        <div class="stat-label">学习单词</div>
                        <div class="stat-value">${stats.totalWords}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">学习时间</div>
                        <div class="stat-value">${timeString}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">${sessionResult.isReview ? '记住' : '简单'}</div>
                        <div class="stat-value">${sessionResult.isReview ? stats.remembered : stats.easyWords}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">${sessionResult.isReview ? '忘记' : '困难'}</div>
                        <div class="stat-value">${sessionResult.isReview ? stats.forgotten : stats.hardWords}</div>
                    </div>
                </div>
                <div class="session-actions">
                    <button class="btn btn-primary" id="backToDashboardBtn">返回主页</button>
                </div>
            </div>
        `;
        
        // 清除主内容区域
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(sessionCompleteContainer);
        
        // 绑定返回按钮
        const backToDashboardBtn = document.getElementById('backToDashboardBtn');
        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', () => {
                this.app.navigate('dashboard');
            });
        }
    }

    // 结束学习会话
    endStudySession() {
        if (confirm('确定要结束当前学习会话吗？')) {
            this.memorySystem.endLearningSession();
            this.app.navigate('dashboard');
        }
    }

    // 检查是否有正在进行的学习会话
    checkActiveLearningSession() {
        if (this.memorySystem.currentLearningSession) {
            const currentWord = this.memorySystem.getCurrentWord();
            if (currentWord) {
                this.showWordCard(currentWord);
            }
        }
    }

    // 显示单词列表页面
    showWordLists() {
        const wordLists = this.wordBank.getAllWordLists();
        
        const wordListsContainer = document.createElement('div');
        wordListsContainer.className = 'word-lists-container';
        
        wordListsContainer.innerHTML = `
            <h2 class="page-title">单词库</h2>
            <div class="word-lists-actions">
                <button class="btn btn-primary" id="addWordListBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    新建单词库
                </button>
            </div>
            <div class="word-lists">
                ${wordLists.map(list => `
                    <div class="word-list-item glass-effect">
                        <div class="word-list-header">
                            <h3>${list.name}</h3>
                            <div class="word-list-meta">
                                <span class="word-count">${list.words.length}个单词</span>
                                <span class="tag-list">
                                    ${list.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </span>
                            </div>
                        </div>
                        <p class="word-list-description">${list.description}</p>
                        <div class="word-list-actions">
                            <button class="btn btn-sm" data-list-id="${list.id}">学习</button>
                            <button class="btn btn-sm btn-secondary" data-list-id="${list.id}">管理</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 清除主内容区域
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(wordListsContainer);
        
        // 绑定单词列表按钮
        const studyButtons = document.querySelectorAll('.word-list-actions .btn:not(.btn-secondary)');
        studyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const listId = button.getAttribute('data-list-id');
                const session = this.memorySystem.startLearningSession(listId);
                if (session && session.words.length > 0) {
                    this.showWordCard(session.words[0]);
                } else {
                    alert('该单词库中没有可学习的单词');
                }
            });
        });
        
        const manageButtons = document.querySelectorAll('.word-list-actions .btn-secondary');
        manageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const listId = button.getAttribute('data-list-id');
                this.showWordListDetails(listId);
            });
        });
        
        // 绑定添加单词列表按钮
        const addWordListBtn = document.getElementById('addWordListBtn');
        if (addWordListBtn) {
            addWordListBtn.addEventListener('click', () => {
                // 显示添加单词列表表单
                // 此处简化处理，实际应用中应显示一个表单
                const name = prompt('请输入单词库名称');
                if (name) {
                    const description = prompt('请输入单词库描述');
                    this.wordBank.addWordList(name, description);
                    this.showWordLists(); // 刷新列表
                }
            });
        }
    }

    // 显示单词列表详情
    showWordListDetails(listId) {
        const list = this.wordBank.getWordListById(listId);
        if (!list) return;
        
        const wordListContainer = document.createElement('div');
        wordListContainer.className = 'word-list-details-container';
        
        wordListContainer.innerHTML = `
            <div class="word-list-header">
                <h2 class="page-title">${list.name}</h2>
                <div class="word-list-actions">
                    <button class="btn btn-primary" id="addWordBtn">添加单词</button>
                    <button class="btn btn-secondary" id="backToListsBtn">返回</button>
                </div>
            </div>
            <p class="word-list-description">${list.description}</p>
            <div class="word-list-tags">
                ${list.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="word-table-container">
                <table class="word-table">
                    <thead>
                        <tr>
                            <th>单词</th>
                            <th>释义</th>
                            <th>记忆级别</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.words.map(word => `
                            <tr>
                                <td>
                                    <div class="word-item">
                                        <div class="word-text">${word.word}</div>
                                        <div class="word-phonetic">${word.phonetic || ''}</div>
                                    </div>
                                </td>
                                <td>${word.meaning}</td>
                                <td>
                                    <div class="memory-level">
                                        <div class="memory-level-indicator level-${word.memoryStatus.level}"></div>
                                        <span>${word.memoryStatus.level}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="word-actions">
                                        <button class="btn-icon edit-word" data-word-id="${word.id}">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button class="btn-icon delete-word" data-word-id="${word.id}">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // 清除主内容区域
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(wordListContainer);
        
        // 绑定返回按钮
        const backToListsBtn = document.getElementById('backToListsBtn');
        if (backToListsBtn) {
            backToListsBtn.addEventListener('click', () => {
                this.showWordLists();
            });
        }
        
        // 绑定添加单词按钮
        const addWordBtn = document.getElementById('addWordBtn');
        if (addWordBtn) {
            addWordBtn.addEventListener('click', () => {
                // 显示添加单词表单
                // 此处简化处理，实际应用中应显示一个表单
                const word = prompt('请输入单词');
                if (word) {
                    const meaning = prompt('请输入释义');
                    const phonetic = prompt('请输入音标 (可选)');
                    const example = prompt('请输入例句 (可选)');
                    
                    this.wordBank.addWordToList(listId, {
                        word,
                        meaning,
                        phonetic,
                        examples: example ? [example] : [],
                        tags: []
                    });
                    
                    this.showWordListDetails(listId); // 刷新列表
                }
            });
        }
        
        // 绑定编辑单词按钮
        const editButtons = document.querySelectorAll('.edit-word');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const wordId = button.getAttribute('data-word-id');
                const wordObj = list.words.find(w => w.id === wordId);
                
                if (wordObj) {
                    // 显示编辑单词表单
                    // 此处简化处理，实际应用中应显示一个表单
                    const word = prompt('请输入单词', wordObj.word);
                    if (word) {
                        const meaning = prompt('请输入释义', wordObj.meaning);
                        const phonetic = prompt('请输入音标 (可选)', wordObj.phonetic);
                        const example = prompt('请输入例句 (可选)', wordObj.examples && wordObj.examples.length > 0 ? wordObj.examples[0] : '');
                        
                        this.wordBank.editWord(listId, wordId, {
                            word,
                            meaning,
                            phonetic,
                            examples: example ? [example] : [],
                        });
                        
                        this.showWordListDetails(listId); // 刷新列表
                    }
                }
            });
        });
        
        // 绑定删除单词按钮
        const deleteButtons = document.querySelectorAll('.delete-word');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const wordId = button.getAttribute('data-word-id');
                if (confirm('确定要删除这个单词吗？')) {
                    this.wordBank.deleteWord(listId, wordId);
                    this.showWordListDetails(listId); // 刷新列表
                }
            });
        });
    }

    // 处理单词发音按钮点击
    handleAudioButtonClick(wordCard) {
        if (!wordCard) return;
        
        const wordText = wordCard.querySelector('.word-text').textContent;
        
        // 实际应用中应调用TTS API或使用预先准备的音频
        console.log(`播放单词 "${wordText}" 的发音`);
        
        // 模拟语音播放效果
        const button = wordCard.querySelector('.memory-btn.memory-audio');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> 播放中...';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
        }
    }

    // 处理标记为已学按钮点击
    handleMarkAsLearnedClick(wordCard) {
        if (!wordCard) return;
        
        const wordText = wordCard.querySelector('.word-text').textContent;
        
        // 将单词标记为已学
        console.log(`将单词 "${wordText}" 标记为已学`);
        
        // 视觉反馈
        wordCard.classList.add('marked-as-learned');
        
        // 添加动画效果
        const button = wordCard.querySelector('.memory-btn.memory-known');
        if (button) {
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> 已学习';
            button.disabled = true;
        }
        
        // 淡出效果
        setTimeout(() => {
            wordCard.style.opacity = '0.5';
        }, 300);
    }

    // 处理学习页面搜索
    handleStudySearch(searchText) {
        if (searchText === undefined) return;
        
        const wordCards = document.querySelectorAll('.study-word-card');
        const normalizedSearch = searchText.trim().toLowerCase();
        
        wordCards.forEach(card => {
            const wordText = card.querySelector('.word-text').textContent.toLowerCase();
            const wordDefinition = card.querySelector('.word-definition').textContent.toLowerCase();
            
            if (normalizedSearch === '' || wordText.includes(normalizedSearch) || wordDefinition.includes(normalizedSearch)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 动态渲染欧路词典单词卡片
    renderEudictWordCards(words) {
        const wordCardsList = document.getElementById('wordCardsList');
        if (!wordCardsList || !words || !Array.isArray(words)) return;
        
        // 清除现有卡片
        wordCardsList.innerHTML = '';
        
        if (words.length === 0) {
            wordCardsList.innerHTML = '<div class="no-words">没有找到单词</div>';
            return;
        }
        
        // 渲染每个单词卡片
        words.forEach(word => {
            const card = document.createElement('div');
            card.className = 'study-word-card glass-effect';
            card.dataset.word = word.word;
            
            const wordParts = this.parseWordExp(word.exp);
            
            card.innerHTML = `
                <div class="word-card__header">
                    <div class="word-text">${word.word}</div>
                    <div class="word-phonetic">${wordParts.phonetic || ''}</div>
                </div>
                <div class="word-card__body">
                    <div class="word-definition">${wordParts.pos ? wordParts.pos + ' ' : ''}${wordParts.meaning}</div>
                    <div class="word-example">${word.context_line || ''}</div>
                </div>
                <div class="word-card__footer">
                    <button class="memory-btn memory-audio">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        发音
                    </button>
                    <button class="memory-btn memory-known">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        标记为已学
                    </button>
                </div>
            `;
            
            wordCardsList.appendChild(card);
        });
    }

    // 解析欧路词典释义格式
    parseWordExp(exp) {
        if (!exp) return { meaning: '' };
        
        const result = {
            pos: '',
            meaning: exp,
            phonetic: ''
        };
        
        // 解析词性 (adj. n. v. 等)
        const posMatch = exp.match(/^([a-z]+\.)(\s|$)/i);
        if (posMatch) {
            result.pos = posMatch[1];
            result.meaning = exp.substring(posMatch[0].length).trim();
        }
        
        return result;
    }
}

// 初始化UI
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    
    // 绑定导航切换事件 - 当进入学习页面时自动加载欧路词典数据
    const topNavLinks = document.querySelectorAll('.top-nav__menu-item');
    topNavLinks.forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            if (href === '#study') {
                // 如果导航到学习页面，加载欧路词典数据
                setTimeout(() => {
                    window.loadEudictWords(1);
                }, 100);
            }
        });
    });
    
    // 加载欧路词典单词并渲染
    window.loadEudictWords = async (page = 1) => {
        try {
            // 显示加载状态
            const loadingIndicator = document.getElementById('wordCardsLoading');
            const wordCardsList = document.getElementById('wordCardsList');
            if (loadingIndicator && wordCardsList) {
                loadingIndicator.style.display = 'flex';
                wordCardsList.style.opacity = '0.5';
            }
            
            const eudictAPI = window.WordsMemoryEudictAPI;
            const data = await eudictAPI.getStudyListWords('0', page);
            
            if (data && data.data) {
                ui.renderEudictWordCards(data.data);
                
                // 更新分页信息
                const currentPageEl = document.getElementById('currentPage');
                const totalPagesEl = document.getElementById('totalPages');
                
                if (currentPageEl) currentPageEl.textContent = page;
                if (totalPagesEl) totalPagesEl.textContent = data.total_pages || 1;
                
                // 更新分页按钮状态
                const prevPageBtn = document.getElementById('prevPageBtn');
                const nextPageBtn = document.getElementById('nextPageBtn');
                
                if (prevPageBtn) prevPageBtn.disabled = page <= 1;
                if (nextPageBtn) nextPageBtn.disabled = page >= (data.total_pages || 1);
                
                // 隐藏加载状态
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (wordCardsList) wordCardsList.style.opacity = '1';
            }
        } catch (error) {
            console.error('加载欧路词典单词失败:', error);
            // 显示错误消息
            const wordCardsList = document.getElementById('wordCardsList');
            const loadingIndicator = document.getElementById('wordCardsLoading');
            if (wordCardsList) {
                wordCardsList.innerHTML = '<div class="error-message">加载单词失败，请稍后再试</div>';
                wordCardsList.style.opacity = '1';
            }
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    };
    
    // 重新绑定分页按钮事件
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', async () => {
            const currentPage = parseInt(document.getElementById('currentPage').textContent);
            if (currentPage > 1) {
                await window.loadEudictWords(currentPage - 1);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', async () => {
            const currentPage = parseInt(document.getElementById('currentPage').textContent);
            const totalPages = parseInt(document.getElementById('totalPages').textContent);
            if (currentPage < totalPages) {
                await window.loadEudictWords(currentPage + 1);
            }
        });
    }
}); 