/**
 * Words Memory - 应用主逻辑
 */

// 全局应用状态
const AppState = {
    currentUser: null,
    currentView: 'welcome', // welcome, dashboard, study, wordbank, review, stats, settings
    isAuthenticated: false,
    userPreferences: {
        dailyGoal: 50,
        reminderEnabled: true,
        theme: 'light'
    },
    study: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        words: [],
        isLoading: false
    }
};

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Words Memory 应用已启动');
    initializeApp();
    bindPaginationEvents();
});

// 初始化应用
function initializeApp() {
    // 检查本地存储中的用户数据
    checkUserAuthentication();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化UI状态
    updateUIState();
    
    // 检查URL参数，处理直接访问子页面的情况
    handleUrlNavigation();
}

// 处理URL导航
function handleUrlNavigation() {
    const path = window.location.pathname;
    
    // 处理直接访问子页面的情况
    if (path.includes('/study')) {
        AppState.currentView = 'study';
        updateUIState();
        updateActiveNavItem('study');
    }
}

// 检查用户认证状态
function checkUserAuthentication() {
    const userData = localStorage.getItem('wordsMemoryUser');
    
    if (userData) {
        try {
            AppState.currentUser = JSON.parse(userData);
            AppState.isAuthenticated = true;
            AppState.currentView = 'dashboard';
        } catch (error) {
            console.error('解析用户数据时出错:', error);
            resetUserState();
        }
    } else {
        resetUserState();
    }
}

// 重置用户状态
function resetUserState() {
    AppState.currentUser = null;
    AppState.isAuthenticated = false;
    AppState.currentView = 'welcome';
}

// 绑定事件监听器
function bindEventListeners() {
    // 欢迎页面开始按钮
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', handleStartButtonClick);
    }
    
    // 顶部导航链接
    const topNavLinks = document.querySelectorAll('.top-nav__menu-item');
    topNavLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // 移动端导航链接
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-item');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

// 处理开始按钮点击
function handleStartButtonClick() {
    // 创建临时用户或显示登录/注册界面
    createTempUser();
    
    // 直接在当前页面显示应用界面
    const welcomeScreen = document.getElementById('welcomeScreen');
    const appContainer = document.getElementById('appContainer');
    
    welcomeScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    // 更新UI状态
    AppState.currentView = 'dashboard';
    updateUIState();
}

// 创建临时用户
function createTempUser() {
    const tempUser = {
        id: generateUserId(),
        name: '访客用户',
        createdAt: new Date().toISOString(),
        stats: {
            wordsLearned: 0,
            wordsMastered: 0,
            streakDays: 0,
            lastActivity: new Date().toISOString()
        },
        preferences: { ...AppState.userPreferences }
    };
    
    AppState.currentUser = tempUser;
    AppState.isAuthenticated = true;
    
    // 保存到本地存储
    localStorage.setItem('wordsMemoryUser', JSON.stringify(tempUser));
}

// 生成用户ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// 处理导航
function handleNavigation(event) {
    event.preventDefault();
    
    // 获取导航目标
    const href = event.currentTarget.getAttribute('href');
    const target = href.includes('/') ? href : href.replace('#', '');
    
    // 直接跳转到对应页面
    window.location.href = target;
}

// 更新活动的导航项
function updateActiveNavItem(target) {
    // 顶部导航
    const topNavLinks = document.querySelectorAll('.top-nav__menu-item');
    topNavLinks.forEach(link => {
        const linkTarget = link.getAttribute('href').replace('#', '');
        
        if (linkTarget === target || (target === 'dashboard' && linkTarget === 'home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 移动端导航
    const mobileLinks = document.querySelectorAll('.mobile-nav .nav-item');
    mobileLinks.forEach(link => {
        const linkTarget = link.getAttribute('href').replace('#', '');
        
        if (linkTarget === target || (target === 'dashboard' && linkTarget === 'home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 更新UI状态
function updateUIState() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const appContainer = document.getElementById('appContainer');
    const dashboardPage = document.getElementById('dashboardPage');
    const studyPage = document.getElementById('studyPage');
    const wordBankPage = document.getElementById('wordBankPage');
    const reviewPage = document.getElementById('reviewPage');
    const statsPage = document.getElementById('statsPage');
    const settingsPage = document.getElementById('settingsPage');
    
    // 检查元素是否存在，防止null错误
    if (AppState.currentView === 'welcome') {
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    } else {
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        // 隐藏所有页面
        const allPages = [dashboardPage, studyPage, wordBankPage, reviewPage, statsPage, settingsPage];
        allPages.forEach(page => {
            if (page) page.classList.add('hidden');
        });
        
        // 显示当前页面
        switch (AppState.currentView) {
            case 'dashboard':
                if (dashboardPage) dashboardPage.classList.remove('hidden');
                break;
            case 'study':
                if (studyPage) {
                    studyPage.classList.remove('hidden');
                    // 如果是首次打开学习页面，加载单词数据
                    if (AppState.study.words.length === 0) {
                        loadStudyWords();
                    }
                }
                break;
            case 'wordbank':
                if (wordBankPage) wordBankPage.classList.remove('hidden');
                break;
            case 'review':
                if (reviewPage) reviewPage.classList.remove('hidden');
                break;
            case 'stats':
                if (statsPage) statsPage.classList.remove('hidden');
                break;
            case 'settings':
                if (settingsPage) settingsPage.classList.remove('hidden');
                break;
        }
    }
}

// 导出公共接口
window.WordsMemoryApp = {
    getState: () => ({ ...AppState }),
    navigate: (view) => {
        // 如果是相对路径，转为绝对路径
        if (view.startsWith('#')) {
            view = view.replace('#', '');
        }
        
        // 如果是页面名称而不是路径，构建路径
        if (!view.includes('/') && view !== 'dashboard' && view !== 'welcome') {
            window.location.href = view + '/';
            return;
        }
        
        // 如果是首页
        if (view === 'dashboard' || view === 'home') {
            window.location.href = '../index.html';
            return;
        }
        
        // 更新当前视图
        AppState.currentView = view;
        updateUIState();
    },
    // 获取欧路词典生词数据
    loadStudyWords: (page = 1) => {
        loadStudyWords(page);
    }
};

// 从欧路词典API加载生词
function loadStudyWords(page = 1) {
    // 更新加载状态
    AppState.study.isLoading = true;
    AppState.study.currentPage = page;
    
    // 显示加载指示器
    const loadingIndicator = document.getElementById('wordCardsLoading');
    const wordCardsList = document.getElementById('wordCardsList');
    if (loadingIndicator && wordCardsList) {
        loadingIndicator.style.display = 'flex';
        wordCardsList.style.opacity = '0.5';
    }
    
    // 更新分页UI
    updatePaginationUI();
    
    // 调用欧路词典API获取单词
    fetch(`https://api.frdic.com/api/open/v1/studylist/words/0?language=en&page=${page}&page_size=${AppState.study.pageSize}`, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.49 Safari/537.36',
            'Authorization': 'NIS WF3vqZU9ZfQCVbL18REXwy/knJpDBcGjr2rWEoO34L6Yp7NFxjRbcQ=='
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 处理返回的数据
        processStudyWords(data);
    })
    .catch(error => {
        console.error('加载单词失败:', error);
        // 处理错误，显示错误信息
        if (wordCardsList) {
            wordCardsList.innerHTML = `<div class="error-message">加载单词失败: ${error.message}</div>`;
            wordCardsList.style.opacity = '1';
        }
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // 使用备用数据
        const eudictAPI = window.WordsMemoryEudictAPI;
        if (eudictAPI) {
            eudictAPI.getStudyListWords('0', page, AppState.study.pageSize)
                .then(data => {
                    processStudyWords(data);
                });
        }
    });
}

// 处理并显示学习单词
function processStudyWords(data) {
    // 更新应用状态
    AppState.study.isLoading = false;
    AppState.study.words = data.data || [];
    AppState.study.totalPages = data.total_pages || 1;
    
    // 隐藏加载指示器
    const loadingIndicator = document.getElementById('wordCardsLoading');
    const wordCardsList = document.getElementById('wordCardsList');
    if (loadingIndicator && wordCardsList) {
        loadingIndicator.style.display = 'none';
        wordCardsList.style.opacity = '1';
    }
    
    // 更新分页UI
    updatePaginationUI();
    
    // 渲染单词卡片
    renderWordCards(AppState.study.words);
}

// 渲染单词卡片
function renderWordCards(words) {
    const wordCardsList = document.getElementById('wordCardsList');
    if (!wordCardsList) return;
    
    // 清空现有内容
    wordCardsList.innerHTML = '';
    
    // 如果没有单词，显示提示
    if (!words || words.length === 0) {
        wordCardsList.innerHTML = '<div class="empty-message">暂无单词数据</div>';
        return;
    }
    
    // 创建单词卡片
    words.forEach(word => {
        const cardElement = document.createElement('div');
        cardElement.className = 'study-word-card glass-effect';
        cardElement.dataset.word = word.word;
        
        cardElement.innerHTML = `
            <div class="word-card__header">
                <div class="word-text">${word.word}</div>
                <div class="word-phonetic">${word.phonetic || ''}</div>
            </div>
            <div class="word-card__body">
                <div class="word-definition">${word.exp || word.meaning}</div>
                <div class="word-example">${word.context_line || (word.examples && word.examples[0]) || ''}</div>
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
        
        wordCardsList.appendChild(cardElement);
    });
    
    // 绑定单词卡片事件
    bindWordCardEvents();
}

// 绑定单词卡片事件
function bindWordCardEvents() {
    // 音频按钮
    const audioButtons = document.querySelectorAll('.memory-audio');
    audioButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const wordCard = e.target.closest('.study-word-card');
            const word = wordCard.dataset.word;
            playWordAudio(word);
        });
    });
    
    // 已学按钮
    const knownButtons = document.querySelectorAll('.memory-known');
    knownButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const wordCard = e.target.closest('.study-word-card');
            wordCard.classList.add('marked-as-known');
            setTimeout(() => {
                wordCard.style.display = 'none';
            }, 500);
        });
    });
}

// 播放单词音频
function playWordAudio(word) {
    if (!word) return;
    
    // 使用Google TTS或其他TTS服务
    const audioUrl = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${word.toLowerCase()}--_us_1.mp3`;
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('播放音频失败:', error);
    });
}

// 更新分页UI
function updatePaginationUI() {
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (currentPageEl) currentPageEl.textContent = AppState.study.currentPage;
    if (totalPagesEl) totalPagesEl.textContent = AppState.study.totalPages;
    
    if (prevPageBtn) prevPageBtn.disabled = AppState.study.currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = AppState.study.currentPage >= AppState.study.totalPages;
}

// 绑定分页按钮事件
function bindPaginationEvents() {
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (AppState.study.currentPage > 1) {
                loadStudyWords(AppState.study.currentPage - 1);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (AppState.study.currentPage < AppState.study.totalPages) {
                loadStudyWords(AppState.study.currentPage + 1);
            }
        });
    }
} 