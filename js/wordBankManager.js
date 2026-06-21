/**
 * Words Memory - 词库管理模块
 */

// 扩展应用命名空间
window.WordsMemoryApp = window.WordsMemoryApp || {};

// 词库管理模块
window.WordsMemoryApp.WordBankManager = {
    // 初始化
    init() {
        // 获取DOM元素
        this.wordListsContainer = document.getElementById('wordListsContainer');
        this.wordListsLoading = document.getElementById('wordListsLoading');
        this.wordLists = document.getElementById('wordLists');
        this.wordListTemplate = document.getElementById('wordListTemplate');
        
        // 操作按钮
        this.createWordListBtn = document.getElementById('createWordListBtn');
        this.importFromEudictBtn = document.getElementById('importFromEudictBtn');
        this.importJsonBtn = document.getElementById('importJsonBtn');
        
        // 欧路词典模态框元素
        this.eudictModal = document.getElementById('eudictModal');
        this.closeEudictModal = document.getElementById('closeEudictModal');
        this.eudictCategories = document.getElementById('eudictCategories');
        this.newWordListName = document.getElementById('newWordListName');
        this.cancelEudictImport = document.getElementById('cancelEudictImport');
        this.confirmEudictImport = document.getElementById('confirmEudictImport');
        
        // 绑定事件
        this.bindEvents();
        
        // 加载词库列表
        this.loadWordLists();
    },
    
    // 绑定事件
    bindEvents() {
        // 创建词库按钮
        if (this.createWordListBtn) {
            this.createWordListBtn.addEventListener('click', () => {
                // TODO: 显示创建词库模态框
                alert('创建词库功能开发中...');
            });
        }
        
        // 从欧路词典导入按钮
        if (this.importFromEudictBtn) {
            this.importFromEudictBtn.addEventListener('click', () => {
                this.openEudictModal();
            });
        }
        
        // 导入JSON按钮
        if (this.importJsonBtn) {
            this.importJsonBtn.addEventListener('click', () => {
                // TODO: 显示导入JSON模态框
                alert('导入JSON功能开发中...');
            });
        }
        
        // 关闭欧路词典模态框按钮
        if (this.closeEudictModal) {
            this.closeEudictModal.addEventListener('click', () => {
                this.closeModal(this.eudictModal);
            });
        }
        
        // 取消欧路词典导入按钮
        if (this.cancelEudictImport) {
            this.cancelEudictImport.addEventListener('click', () => {
                this.closeModal(this.eudictModal);
            });
        }
        
        // 确认欧路词典导入按钮
        if (this.confirmEudictImport) {
            this.confirmEudictImport.addEventListener('click', () => {
                this.importFromEudict();
            });
        }
    },
    
    // 加载词库列表
    loadWordLists() {
        // 显示加载中
        this.wordListsLoading.style.display = 'flex';
        this.wordLists.innerHTML = '';
        
        // 获取单词库
        const wordBank = window.WordsMemoryWordBank;
        if (!wordBank) {
            console.error('单词库未初始化');
            this.showError('无法加载单词库');
            return;
        }
        
        // 获取所有单词列表
        const wordLists = wordBank.getAllWordLists();
        
        // 延迟一下，模拟加载过程
        setTimeout(() => {
            // 隐藏加载中
            this.wordListsLoading.style.display = 'none';
            
            // 渲染词库列表
            if (wordLists.length === 0) {
                this.showEmptyState();
            } else {
                this.renderWordLists(wordLists);
            }
        }, 500);
    },
    
    // 渲染词库列表
    renderWordLists(wordLists) {
        // 清空列表
        this.wordLists.innerHTML = '';
        
        // 遍历词库
        wordLists.forEach(list => {
            // 克隆模板
            const template = this.wordListTemplate.content.cloneNode(true);
            const wordListCard = template.querySelector('.wordlist-card');
            
            // 设置ID
            wordListCard.dataset.id = list.id;
            
            // 设置名称和描述
            template.querySelector('.wordlist-name').textContent = list.name;
            template.querySelector('.wordlist-description').textContent = list.description;
            
            // 设置统计信息
            const wordCount = list.words.length;
            const masteredCount = list.words.filter(word => word.memoryStatus.level >= 5).length;
            template.querySelector('.wordlist-count').textContent = `${wordCount}个单词`;
            template.querySelector('.wordlist-mastered').textContent = `已掌握: ${masteredCount}`;
            
            // 设置标签
            const tagsContainer = template.querySelector('.wordlist-tags');
            tagsContainer.innerHTML = '';
            if (list.tags && list.tags.length > 0) {
                list.tags.forEach(tag => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'tag';
                    tagEl.textContent = tag;
                    tagsContainer.appendChild(tagEl);
                });
            }
            
            // 绑定按钮事件
            const studyBtn = template.querySelector('.wordlist-study-btn');
            studyBtn.addEventListener('click', () => {
                // 检查是否为欧路词典导入的词库
                const isEudict = list.tags && list.tags.includes('欧路词典');
                if (isEudict) {
                    // 带上欧路词典标记跳转到学习页面
                    window.location.href = `../study/?eudict=true&category=${encodeURIComponent(list.id.replace('list_', ''))}`;
                } else {
                    // 普通词库跳转
                    window.location.href = `../study/?wordlist=${list.id}`;
                }
            });
            
            // 菜单按钮
            const menuToggle = template.querySelector('.wordlist-menu-toggle');
            const menuDropdown = template.querySelector('.wordlist-menu-dropdown');
            
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menuDropdown.classList.toggle('active');
            });
            
            // 点击其他地方关闭菜单
            document.addEventListener('click', () => {
                if (menuDropdown.classList.contains('active')) {
                    menuDropdown.classList.remove('active');
                }
            });
            
            // 菜单项事件
            const editBtn = template.querySelector('.edit-wordlist');
            const exportBtn = template.querySelector('.export-wordlist');
            const deleteBtn = template.querySelector('.delete-wordlist');
            
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // TODO: 实现编辑功能
                alert('编辑功能开发中...');
            });
            
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportWordList(list.id);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteWordList(list.id);
            });
            
            // 添加到列表
            this.wordLists.appendChild(template);
        });
    },
    
    // 显示空状态
    showEmptyState() {
        this.wordLists.innerHTML = `
            <div class="empty-state glass-effect">
                <div class="empty-state-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <h3>还没有词库</h3>
                <p>创建一个新词库或导入现有词库来开始学习</p>
                <button class="btn btn-primary" id="emptyStateCreateBtn">创建词库</button>
            </div>
        `;
        
        // 绑定空状态下的创建按钮
        document.getElementById('emptyStateCreateBtn').addEventListener('click', () => {
            // TODO: 显示创建词库模态框
            alert('创建词库功能开发中...');
        });
    },
    
    // 显示错误信息
    showError(message) {
        this.wordListsLoading.style.display = 'none';
        this.wordLists.innerHTML = `
            <div class="error-state glass-effect">
                <div class="error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3>出错了</h3>
                <p>${message}</p>
                <button class="btn btn-primary" id="retryBtn">重试</button>
            </div>
        `;
        
        // 绑定重试按钮
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.loadWordLists();
        });
    },
    
    // 打开欧路词典模态框
    async openEudictModal() {
        // 打开模态框
        this.openModal(this.eudictModal);
        
        // 设置默认词库名称
        this.newWordListName.value = '欧路词典生词';
        
        // 加载欧路词典分类
        await this.loadEudictCategories();
    },
    
    // 加载欧路词典分类
    async loadEudictCategories() {
        try {
            // 显示加载中
            this.eudictCategories.innerHTML = '<div class="loading-spinner">加载中...</div>';
            
            // 获取欧路词典API
            const eudictAPI = window.WordsMemoryEudictAPI;
            if (!eudictAPI) {
                throw new Error('欧路词典API未初始化');
            }
            
            // 使用欧路词典API直接获取分类
            const response = await eudictAPI.getCategories();
            
            if (!response || !response.data) {
                throw new Error('获取欧路词典分类失败');
            }
            
            // 显示分类列表
            this.renderEudictCategories(response.data);
            
        } catch (error) {
            console.error('加载欧路词典分类失败:', error);
            this.eudictCategories.innerHTML = `
                <div class="error-message">
                    <p>加载分类失败，请重试</p>
                    <button class="btn btn-secondary" id="retryLoadCategoriesBtn">重试</button>
                </div>
            `;
            
            // 绑定重试按钮
            document.getElementById('retryLoadCategoriesBtn').addEventListener('click', () => {
                this.loadEudictCategories();
            });
        }
    },
    
    // 渲染欧路词典分类
    renderEudictCategories(categories) {
        // 清空容器
        this.eudictCategories.innerHTML = '';
        
        // 如果没有分类
        if (!categories || categories.length === 0) {
            this.eudictCategories.innerHTML = '<p>未找到生词本</p>';
            return;
        }
        
        // 添加默认分类（所有生词）
        const allCategory = { id: '0', name: '所有生词' };
        
        // 合并所有分类
        const allCategories = [allCategory].concat(categories);
        
        // 创建分类元素
        allCategories.forEach((category, index) => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'eudict-category';
            if (index === 0) {
                categoryEl.classList.add('selected');
            }
            categoryEl.dataset.id = category.id;
            
            categoryEl.innerHTML = `
                <div class="eudict-category-name">${category.name}</div>
                <div class="eudict-category-count">${category.count || '未知'} 个单词</div>
            `;
            
            // 绑定点击事件
            categoryEl.addEventListener('click', () => {
                // 取消其他选中
                document.querySelectorAll('.eudict-category').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // 选中当前
                categoryEl.classList.add('selected');
            });
            
            // 添加到容器
            this.eudictCategories.appendChild(categoryEl);
        });
    },
    
    // 从欧路词典导入单词
    async importFromEudict() {
        try {
            // 获取选中的分类
            const selectedCategory = document.querySelector('.eudict-category.selected');
            if (!selectedCategory) {
                throw new Error('请选择一个分类');
            }
            
            const categoryId = selectedCategory.dataset.id;
            const wordListName = this.newWordListName.value.trim() || '欧路词典生词';
            
            // 修改按钮状态
            this.confirmEudictImport.textContent = '导入中...';
            this.confirmEudictImport.disabled = true;
            
            // 获取欧路词典API
            const eudictAPI = window.WordsMemoryEudictAPI;
            if (!eudictAPI) {
                throw new Error('欧路词典API未初始化');
            }
            
            // 直接使用eudictAPI获取单词
            const response = await eudictAPI.getStudyListWords(categoryId, 1, 100);
            
            if (!response || !response.data || response.data.length === 0) {
                throw new Error('未找到单词数据');
            }
            
            // 创建新词库
            const wordBank = window.WordsMemoryWordBank;
            const newWordList = wordBank.addWordList(
                wordListName,
                `从欧路词典导入的单词`,
                ['欧路词典', '导入']
            );
            
            // 添加单词到词库
            eudictAPI.addWordsToLocalWordBank(response.data, wordBank, newWordList.id);
            
            // 关闭模态框
            this.closeModal(this.eudictModal);
            
            // 刷新词库列表
            this.loadWordLists();
            
            // 显示成功消息
            alert(`成功导入 ${response.data.length} 个单词到词库 "${wordListName}"`);
            
        } catch (error) {
            console.error('从欧路词典导入单词失败:', error);
            alert('导入失败: ' + error.message);
        } finally {
            // 恢复按钮状态
            this.confirmEudictImport.textContent = '导入';
            this.confirmEudictImport.disabled = false;
        }
    },
    
    // 导出词库
    exportWordList(listId) {
        try {
            const wordBank = window.WordsMemoryWordBank;
            const exportData = wordBank.exportWordList(listId);
            
            if (!exportData) {
                throw new Error('找不到词库');
            }
            
            // 创建下载链接
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // 获取词库名称作为文件名
            const wordList = wordBank.getWordListById(listId);
            const fileName = wordList ? `${wordList.name}.json` : 'wordlist.json';
            
            // 创建下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            
            // 添加到文档并触发点击
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('导出词库失败:', error);
            alert('导出失败: ' + error.message);
        }
    },
    
    // 删除词库
    deleteWordList(listId) {
        try {
            // 确认删除
            if (!confirm('确定要删除此词库吗？此操作无法撤销。')) {
                return;
            }
            
            const wordBank = window.WordsMemoryWordBank;
            const success = wordBank.deleteWordList(listId);
            
            if (!success) {
                throw new Error('删除词库失败');
            }
            
            // 重新加载词库列表
            this.loadWordLists();
            
        } catch (error) {
            console.error('删除词库失败:', error);
            alert('删除失败: ' + error.message);
        }
    },
    
    // 打开模态框
    openModal(modal) {
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    // 关闭模态框
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.WordsMemoryApp.WordBankManager.init();
}); 