// ===== SEARCH SYSTEM - FINAL CLEAN =====
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const poemGrid = document.getElementById('poemGrid');
    const categoriesSection = document.getElementById('categoriesSection');
    const repeatCategories = document.getElementById('repeatCategories');
    const popularSection = document.getElementById('popularSection');
    const heroSection = document.getElementById('heroSection');
    const quoteSection = document.getElementById('quoteSection');
    const aboutSection = document.getElementById('aboutSection');
    const statsSection = document.getElementById('statsSection');
    const authorSection = document.getElementById('authorSection');
    const footerSection = document.getElementById('footerSection');
    
    // ===== सभी poems को एक जगह इकट्ठा करें =====
    let allPoemCards = [];
    
    document.querySelectorAll('#poemGrid .poem-card').forEach(card => {
        allPoemCards.push(card);
    });
    
    document.querySelectorAll('#popularSection .poem-grid .poem-card').forEach(card => {
        allPoemCards.push(card);
    });

    // ===== HINGLISH ↔ HINDI MAP =====
    const transliterationMap = {
        'maa': 'माँ', 'ma': 'माँ', 'mother': 'माँ', 'ammi': 'माँ',
        'mom': 'माँ', 'mummy': 'माँ', 'mama': 'माँ', 'maiya': 'मैया',
        'maai': 'माई', 'mata': 'माता', 'matri': 'मातृ',
        'pyaar': 'प्रेम', 'pyar': 'प्रेम', 'prem': 'प्रेम', 'love': 'प्रेम',
        'pita': 'पिता', 'father': 'पिता', 'dad': 'पिता', 'papa': 'पिता',
        'family': 'परिवार', 'parivar': 'परिवार', 'ghar': 'घर',
        'sangharsh': 'संघर्ष', 'struggle': 'संघर्ष',
        'prerna': 'प्रेरणा', 'inspiration': 'प्रेरणा',
        'akela': 'अकेला', 'akelapan': 'अकेलापन', 'loneliness': 'अकेलापन',
        'jivan': 'जीवन', 'jeevan': 'जीवन', 'life': 'जीवन',
        'prakriti': 'प्रकृति', 'nature': 'प्रकृति',
        'deshbhakti': 'देशभक्ति', 'patriotism': 'देशभक्ति',
        'samay': 'समय', 'time': 'समय',
        'dil': 'दिल', 'heart': 'दिल', 'ehsaas': 'एहसास',
        'shabd': 'शब्द', 'kavita': 'कविता', 'poem': 'कविता'
    };

    // ===== NORMALIZE FUNCTION =====
    function normalizeText(text) {
        if (!text) return '';
        text = text.toLowerCase().trim();
        text = text.replace(/[\u0964-\u0965]/g, '');
        
        for (let [key, value] of Object.entries(transliterationMap)) {
            let regex = new RegExp('\\b' + key + '\\b', 'gi');
            text = text.replace(regex, value);
            text = text.replace(new RegExp(key, 'gi'), value);
        }
        
        text = text.replace(/\s+/g, ' ').trim();
        return text;
    }

    // ===== SEARCH FUNCTION =====
    window.searchPoems = function() {
        let query = document.getElementById('searchInput').value.trim();
        
        // ===== पहले सारे पुराने मैसेज हटाएँ =====
        removeAllMessages();
        
        if (query === '') {
            resetDisplay();
            return;
        }

        let normalizedQuery = normalizeText(query);
        let foundCount = 0;
        let foundCards = [];

        // ===== Latest Poems ग्रिड को क्लियर करें =====
        if (poemGrid) {
            poemGrid.innerHTML = '';
        }

        // ===== सारे कार्ड में सर्च करें =====
        allPoemCards.forEach(card => {
            let title = card.querySelector('.poem-title')?.innerText || '';
            let excerpt = card.querySelector('.poem-excerpt')?.innerText || '';
            let category = card.querySelector('.poem-meta a')?.innerText || '';
            
            let normalizedTitle = normalizeText(title);
            let normalizedExcerpt = normalizeText(excerpt);
            let normalizedCategory = normalizeText(category);
            
            let isMatch = false;
            
            // Original text में खोजें
            if (title.includes(query) || excerpt.includes(query) || category.includes(query)) {
                isMatch = true;
            }
            
            // Normalized text में खोजें
            if (normalizedTitle.includes(normalizedQuery) || 
                normalizedExcerpt.includes(normalizedQuery) || 
                normalizedCategory.includes(normalizedQuery)) {
                isMatch = true;
            }
            
            // MAA Special
            if (query === 'maa' || query === 'ma' || query === 'माँ' || query === 'मा') {
                if (title.includes('माँ') || excerpt.includes('माँ') || 
                    title.includes('माता') || excerpt.includes('माता') ||
                    title.includes('मैया') || excerpt.includes('मैया') ||
                    title.includes('ममता') || excerpt.includes('ममता') ||
                    title.includes('मां') || excerpt.includes('मां')) {
                    isMatch = true;
                }
            }
            
            if (isMatch) {
                foundCount++;
                foundCards.push(card);
            }
        });

        // ===== RESULTS दिखाएँ =====
        if (foundCount > 0) {
            // सारे found cards को Latest Poems ग्रिड में डालें
            foundCards.forEach(card => {
                let clonedCard = card.cloneNode(true);
                if (poemGrid) {
                    poemGrid.appendChild(clonedCard);
                }
            });
            
            // Count दिखाएँ
            let countMsg = document.createElement('div');
            countMsg.id = 'searchCount';
            countMsg.style.cssText = `
                text-align: center;
                padding: 0.5rem;
                font-size: 0.95rem;
                color: #475569;
                background: rgba(255,255,255,0.15);
                border-radius: 20px;
                margin: 0.5rem 0 1rem;
            `;
            countMsg.innerHTML = `✨ <strong>${foundCount}</strong> कविताएँ मिलीं "<strong>${query}</strong>" के लिए`;
            
            if (poemGrid) {
                poemGrid.parentNode.insertBefore(countMsg, poemGrid);
            }
            
        } else {
            // No results
            let noResultMsg = document.createElement('div');
            noResultMsg.id = 'noResultMsg';
            noResultMsg.style.cssText = `
                text-align: center;
                padding: 3rem 1rem;
                font-family: 'Noto Serif Devanagari', serif;
                font-size: 1.4rem;
                color: #334155;
                background: rgba(255,255,255,0.2);
                border-radius: 30px;
                border: 1px solid rgba(255,255,255,0.25);
                margin: 1rem 0;
            `;
            noResultMsg.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">😔</div>
                <p>कोई कविता नहीं मिली "<strong style="color:#0f172a;">${query}</strong>"</p>
                <p style="font-size: 1rem; margin-top: 0.3rem;">कृपया कोई और शब्द खोजें... 📝</p>
            `;
            
            if (poemGrid) {
                poemGrid.parentNode.insertBefore(noResultMsg, poemGrid);
            }
        }

        // ===== HIDE OTHER SECTIONS =====
        if (query.length > 0) {
            const hideSections = [
                categoriesSection,
                repeatCategories,
                quoteSection,
                aboutSection,
                statsSection,
                authorSection,
                footerSection,
                popularSection
            ];
            
            hideSections.forEach(section => {
                if (section) {
                    section.style.display = 'none';
                }
            });
            
            if (heroSection) {
                heroSection.style.padding = '2rem 1.5rem';
                heroSection.style.margin = '0.5rem 0';
            }
            
        } else {
            resetDisplay();
        }
    };

    // ===== REMOVE ALL MESSAGES =====
    function removeAllMessages() {
        let noResultMsg = document.getElementById('noResultMsg');
        if (noResultMsg) {
            noResultMsg.remove();
        }
        
        let countMsg = document.getElementById('searchCount');
        if (countMsg) {
            countMsg.remove();
        }
    }

    // ===== RESET DISPLAY =====
    function resetDisplay() {
        // Remove all messages
        removeAllMessages();
        
        // Latest Poems ग्रिड को रीसेट करें
        if (poemGrid) {
            poemGrid.innerHTML = '';
            document.querySelectorAll('#poemGrid .poem-card').forEach(card => {
                if (!poemGrid.contains(card)) {
                    poemGrid.appendChild(card);
                }
            });
        }
        
        // सारे सेक्शन दिखाएँ
        const showSections = [
            categoriesSection,
            repeatCategories,
            popularSection,
            quoteSection,
            aboutSection,
            statsSection,
            authorSection,
            footerSection
        ];
        
        showSections.forEach(section => {
            if (section) {
                section.style.display = 'block';
            }
        });
        
        if (heroSection) {
            heroSection.style.padding = '4rem 2.5rem';
            heroSection.style.margin = '1.5rem 0';
        }
    }

    // ===== ENTER KEY SUPPORT =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            let searchInput = document.getElementById('searchInput');
            if (document.activeElement === searchInput) {
                e.preventDefault();
                window.searchPoems();
            }
        }
    });

    console.log('✅ शब्दलोक सर्च - FINAL CLEAN VERSION!');
});
