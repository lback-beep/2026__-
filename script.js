/**
 * 市長颱風決策遊戲 - 雲端同步版
 * 銘傳大學 公共事務與行政管理學系
 */

// --- Firebase 設定區 ---
// 請前往 Firebase Console 建立專案，並將您的 Web App 設定貼在下方
const firebaseConfig = {
    apiKey: "您的_API_KEY",
    authDomain: "您的_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://您的_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "您的_PROJECT_ID",
    storageBucket: "您的_PROJECT_ID.appspot.com",
    messagingSenderId: "您的_SENDER_ID",
    appId: "您的_APP_ID"
};

// 初始化 Firebase (如果沒有 Config 則使用本地模式作為備援)
let db = null;
let isCloudEnabled = false;

if (firebaseConfig.apiKey !== "您的_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    isCloudEnabled = true;
    console.log("Firebase 雲端同步已啟動");
} else {
    console.warn("尚未設定 Firebase Config，目前運行於本地累計模式。");
}

// --- 數據結構 ---
const DEFAULT_DATA = {
    'A': { count: 0, label: '提前全天停課', insight: '安全第一！這反映了大多數學生對於安全防範的高度重視。' },
    'B': { count: 0, label: '正常上班上課', insight: '守護日常！選擇此項的學生通常更看重學習進度的維持。' },
    'C': { count: 0, label: '宣布半天停課', insight: '彈性靈活！這顯示了在安全與運作之間尋求平衡的務實考量。' }
};

let pollData = JSON.parse(localStorage.getItem('typhoon_poll_local')) || DEFAULT_DATA;

// --- 雲端數據監聽 ---
if (isCloudEnabled) {
    const statsRef = db.ref('typhoon_stats');
    statsRef.on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData) {
            // 更新本地快照
            Object.keys(cloudData).forEach(key => {
                if (pollData[key]) pollData[key].count = cloudData[key];
            });
        }
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.card').forEach(card => card.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function makeDecision(choice) {
    const userChoiceText = document.getElementById('user-choice-text');
    const insightText = document.getElementById('insight-text');
    
    userChoiceText.textContent = pollData[choice].label;
    insightText.innerHTML = '<span class="loading-dots">正在連線雲端並彙整數據...</span>';
    
    // 增加票數
    if (isCloudEnabled) {
        // 使用 Firebase 交易 (Transaction) 確保多人同時點擊時數據正確
        db.ref('typhoon_stats/' + choice).transaction((currentCount) => {
            return (currentCount || 0) + 1;
        });
    } else {
        // 本地備援模式
        pollData[choice].count++;
        localStorage.setItem('typhoon_poll_local', JSON.stringify(pollData));
    }
    
    showScreen('screen-results');
    resetStats();

    setTimeout(() => {
        insightText.textContent = pollData[choice].insight;
        animateStats();
    }, 1500);
}

function resetStats() {
    Object.keys(pollData).forEach(key => {
        document.getElementById(`stat-${key.toLowerCase()}-val`).textContent = '0%';
        document.getElementById(`count-${key.toLowerCase()}`).textContent = '(0 票)';
        document.getElementById(`bar-${key.toLowerCase()}`).style.width = '0%';
    });
}

function animateStats() {
    const totalVotes = Object.values(pollData).reduce((sum, item) => sum + item.count, 0);
    
    Object.keys(pollData).forEach(key => {
        const data = pollData[key];
        const valElement = document.getElementById(`stat-${key.toLowerCase()}-val`);
        const countElement = document.getElementById(`count-${key.toLowerCase()}`);
        const barElement = document.getElementById(`bar-${key.toLowerCase()}`);
        
        const targetPercent = totalVotes > 0 ? (data.count / totalVotes) * 100 : 0;
        const duration = 2000;
        const startTime = performance.now();
        
        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            valElement.textContent = `${(easeProgress * targetPercent).toFixed(1)}%`;
            countElement.textContent = `(${Math.floor(easeProgress * data.count)} 票)`;
            barElement.style.width = `${easeProgress * targetPercent}%`;
            
            if (progress < 1) requestAnimationFrame(updateCount);
        }
        requestAnimationFrame(updateCount);
    });
}

// 粒子背景
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'storm-particle';
        Object.assign(p.style, {
            position: 'absolute',
            background: 'rgba(255, 255, 255, 0.1)',
            width: '2px', height: (Math.random() * 50 + 50) + 'px',
            left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
            transform: 'rotate(20deg)', filter: 'blur(1px)'
        });
        p.animate([{ transform: 'translate(0, -100px) rotate(20deg)', opacity: 0 }, { opacity: 0.5, offset: 0.1 }, { transform: 'translate(200px, 1000px) rotate(20deg)', opacity: 0 }], { duration: 2000 / (Math.random() * 0.5 + 0.5), iterations: Infinity, delay: Math.random() * 2000 });
        container.appendChild(p);
    }
}

document.addEventListener('DOMContentLoaded', createParticles);
