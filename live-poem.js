// ============================================================
// 📅 DAILY POEM - Google Sheets API (Only First Row)
// ============================================================

// 🔗 तुम्हारी API URL
const API_URL = "https://script.google.com/macros/s/AKfycbxYWYMLhZmB6IUDRedVBgu4CDF7vtw3THT7hcv86MsNqynO2sYplNNnPbjAzPSXSl3X/exec";

let poemData = [];

// ============================================================
// 📥 API से सिर्फ पहली पंक्ति Load करो
// ============================================================

async function loadPoemsFromAPI() {
    try {
        const response = await fetch(API_URL + '?t=' + Date.now());
        const data = await response.json();
        
        if (data.success && data.data) {
            // सिर्फ पहली पंक्ति (index 0) लें
            poemData = data.data.slice(0, 1);
            console.log('✅ Only First Row Loaded:', poemData.length);
            return poemData;
        } else {
            console.error('API Error:', data.error || 'Unknown error');
            return [];
        }
    } catch (error) {
        console.error('❌ Fetch Error:', error);
        return [];
    }
}

// ============================================================
// 📅 हमेशा पहली पंक्ति लौटाएं
// ============================================================

function getTodayPoem() {
    if (poemData.length === 0) return null;
    return poemData[0]; // सिर्फ पहली पंक्ति
}

// ============================================================
// 🖼️ Image Check - URL Valid है या नहीं
// ============================================================

function isValidImageUrl(url) {
    if (!url || url.trim() === '') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('drive.google.com') || 
           lowerUrl.includes('imgur.com') ||
           lowerUrl.includes('i.ibb.co');
}

// ============================================================
// 🔥 Live Poem Display - सिर्फ पहली पंक्ति के सभी कॉलम दिखाएं
// ============================================================

async function displayLivePoem() {
    const bodyEl = document.getElementById('livePoemBody');
    const footerEl = document.getElementById('livePoemFooter');
    const dateEl = document.querySelector('.live-poem-sub');
    
    if (bodyEl) {
        bodyEl.innerHTML = `<p style="text-align:center; padding: 1rem;">⏳ कविता लोड हो रही है...</p>`;
    }
    
    await loadPoemsFromAPI();
    
    const poem = getTodayPoem();
    
    if (!poem) {
        if (bodyEl) {
            bodyEl.innerHTML = `<p style="text-align:center; color: #b91c1c;">❌ कोई कविता नहीं मिली।</p>`;
        }
        return;
    }
    
    if (bodyEl) {
        // सभी कॉलम का डेटा दिखाएं
        let imgHTML = '';
        const imageUrl = poem.img || '';
        
        if (isValidImageUrl(imageUrl)) {
            imgHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="${imageUrl}" 
                         alt="Poem Image" 
                         style="max-width: 100%; max-height: 250px; border-radius: 16px; 
                                box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
                                object-fit: cover;"
                         onerror="this.style.display='none'; this.parentElement.style.display='none';">
                </div>
            `;
        }
        
        const description = (poem.description || '').replace(/\n/g, '<br>');
        const title = poem.title || poem.category || '✨ आज की कविता आने वाली है';
        
        let highlightHTML = '';
        if (poem.highlight && poem.highlight.trim() !== '') {
            highlightHTML = `<div class="live-highlight"><span>${poem.highlight}</span></div>`;
        }
        
        bodyEl.innerHTML = `
            ${imgHTML}
            <span class="live-poem-category">${title}</span>
            <p class="live-poem-excerpt">${description}</p>
            ${highlightHTML}
        `;
    }
    
    if (footerEl) {
        const nextPoem = poem.next || '✨ नई कविता';
        const link = poem.link || '#';
        
        footerEl.innerHTML = `
            <span class="live-poem-next">📅 कल आएगी : <strong>${nextPoem}</strong></span>
            <a href="${link}" class="btn-live">📖 पूरी कविता पढ़ें →</a>
        `;
    }
    
    if (dateEl) {
        const todayDate = new Date().toLocaleDateString('hi-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        dateEl.textContent = `📅 ${todayDate} · हर दिन एक नई कविता, दिल से सीधे दिल तक।`;
    }
    
    console.log('✅ First Row Poem:', poem.title || poem.category);
}

// ============================================================
// 🚀 Page Load पर Auto-Run
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    displayLivePoem();
    setInterval(displayLivePoem, 300000);
});

// ============================================================
// 🕐 TIME AGO - हर कविता का समय दिखाने के लिए
// ============================================================

function timeAgo(dateStr) {
    let date = new Date(dateStr);
    if (!dateStr.includes('T')) {
        const parts = dateStr.split('-');
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffYear > 0) return diffYear === 1 ? '1 साल पहले' : diffYear + ' साल पहले';
    if (diffMonth > 0) return diffMonth === 1 ? '1 महीना पहले' : diffMonth + ' महीने पहले';
    if (diffWeek > 0) return diffWeek === 1 ? '1 हफ्ता पहले' : diffWeek + ' हफ्ते पहले';
    if (diffDay > 0) return diffDay === 1 ? '1 दिन पहले' : diffDay + ' दिन पहले';
    if (diffHour > 0) return diffHour === 1 ? '1 घंटा पहले' : diffHour + ' घंटे पहले';
    if (diffMin > 5) return diffMin + ' मिनट पहले';
    return 'अभी-अभी';
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.time-ago').forEach(function(el) {
        const dateStr = el.getAttribute('data-date');
        if (dateStr) {
            el.textContent = '📅 ' + timeAgo(dateStr);
        }
    });
});
