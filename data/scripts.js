/// ================= LOGIN PAGE =================
if (document.body.classList.contains('login-page')) {
    // 이미지 초기화 함수
    function initializeLoginImages() {
        const ultraImage = document.querySelector('.ultra-image');
        const ultraText = document.querySelector('.ultra-text');
        const fistContainer = document.querySelector('.fist-container');

        if (ultraImage) {
            ultraImage.src = "images/ultra.png"; // 기본 이미지로 초기화
        }
        if (ultraText) {
            ultraText.classList.remove('animate-ultra'); // 애니메이션 클래스 제거
        }
        if (fistContainer) {
            fistContainer.classList.remove('animate-fist'); // 애니메이션 클래스 제거
        }
    }

    // 페이지 로드 시 이미지 초기화
    window.addEventListener('load', initializeLoginImages);
    // 추가로 DOMContentLoaded 시점에도 초기화 (보험)
    window.addEventListener('DOMContentLoaded', initializeLoginImages);

    // 브라우저 뒤로가기/앞으로가기 시에도 초기화 (bfcache 대응)
    window.addEventListener('pageshow', function(event) {
        // bfcache에서 복원된 경우에도 초기화
        if (event.persisted) {
            initializeLoginImages();
        }
        // 일반적인 뒤로가기/앞으로가기 시에도 초기화
        initializeLoginImages();
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginBtn = document.querySelector('.login-btn');
        const ultraText = document.querySelector('.ultra-text');
        const ultraImage = document.querySelector('.ultra-image');
        const fistContainer = document.querySelector('.fist-container');
        const idInput = document.getElementById('idInput');
        const passwordInput = document.getElementById('password');

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = idInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                alert('아이디와 비밀번호를 입력해주세요.');
                return;
            }

            loginBtn.classList.add('loading');

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                loginBtn.classList.remove('loading');
                if (data.success) {
                    localStorage.setItem('user_id', data.user_id);
                    localStorage.setItem('username', data.username);
                    fistContainer.classList.add('animate-fist');

                    setTimeout(function() {
                        ultraText.classList.add('animate-ultra');
                        ultraImage.src = "images/ultra2.png";
                    }, 350);

                    setTimeout(function() {
                        window.location.href = "main.html";
                    }, 2200);
                } else {
                    alert('로그인에 실패했습니다.');
                }
            })
            .catch(err => {
                loginBtn.classList.remove('loading');
                console.error('Login error:', err);
                alert('통신 오류');
            });
        });
    }

    // Register form handling (for register.html)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const regBtn = registerForm.querySelector('.login-btn');
        const regIdInput = document.getElementById('regIdInput');
        const regPassword = document.getElementById('regPassword');
        const regConfirmPassword = document.getElementById('regConfirmPassword');

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = regIdInput.value.trim();
            const password = regPassword.value;
            const confirmPassword = regConfirmPassword.value;

            if (!username || !password || !confirmPassword) {
                alert('모든 필드를 입력해주세요.');
                return;
            }

            if (password !== confirmPassword) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            regBtn.classList.add('loading');

            fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                regBtn.classList.remove('loading');
                if (data.success) {
                    alert('회원가입 성공! 로그인해주세요.');
                    showLoginForm();
                    // Clear the register form
                    if (regIdInput) regIdInput.value = '';
                    if (regPassword) regPassword.value = '';
                    if (regConfirmPassword) regConfirmPassword.value = '';
                } else {
                    alert(data.message || '회원가입 실패');
                }
            })
            .catch(err => {
                regBtn.classList.remove('loading');
                console.error('Register error:', err);
                alert('통신 오류');
            });
        });
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('signupLink').style.display = 'none';
    document.querySelector('h1').innerText = 'Sign up';

    // Clear login form inputs when switching to register
    document.getElementById('idInput').value = '';
    document.getElementById('password').value = '';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupLink').style.display = 'block';
    document.querySelector('h1').innerText = 'Login';

    // Clear register form inputs when switching to login
    const regIdInput = document.getElementById('regIdInput');
    const regPassword = document.getElementById('regPassword');
    const regConfirmPassword = document.getElementById('regConfirmPassword');

    if (regIdInput) regIdInput.value = '';
    if (regPassword) regPassword.value = '';
    if (regConfirmPassword) regConfirmPassword.value = '';
}





// ================= MAIN PAGE =================
if (document.body.classList.contains('main-page')) {
    function goToMeasure() { 
        window.location.href = "measure.html"; 
    }

    function goToRanking() { 
        window.location.href = "ranking.html"; 
    }

    function goToExplanation() { 
        window.location.href = "explanation.html"; 
    }

    function findLocalIP() {
        // Try to find the local server IP by attempting common localhost addresses
        const testIPs = ['127.0.0.1', '192.168.0.1', '192.168.1.1', '10.0.0.1'];
        console.log('🔍 로컬 서버 IP 탐색 중...');

        // 현재 도메인을 기반으로 추측
        const currentHost = window.location.hostname;
        if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            console.log('💡 현재 서버 IP: ', currentHost);
            return currentHost;
        }

        // localhost 연결이면 127.0.0.1을 기본으로 사용
        console.log('💡 로컬호스트 감지됨: 127.0.0.1');
        return '127.0.0.1';
    }

    window.findLocalIP = findLocalIP;
    window.goToMeasure = goToMeasure;
    window.goToRanking = goToRanking;
    window.goToExplanation = goToExplanation;
}

// ================= MEASURE PAGE =================
if (document.body.classList.contains('measure-page')) {
    let records = [];

    window.addEventListener('DOMContentLoaded', function() {
        const bgImages = ['images/bg2.png', 'images/bg3.png', 'images/bg4.png'];
        const randomIndex = Math.floor(Math.random() * bgImages.length);
        document.getElementById('randomBg').src = bgImages[randomIndex];
    });

    let pollInterval = null;

    function startMeasure() {
        // Check if already measuring
        if (pollInterval) {
            clearInterval(pollInterval);
            clearTimeout(measurementTimeout);
        }

        // 1. 서버에 리셋 요청 and set score to 0p
        fetch('/reset')
            .then(response => response.json())
            .then(data => {
                console.log('Score reset:', data);
                document.getElementById("score").innerText = "0p";

                // 2. 시작 카운트다운 표시
                let countdown = 3;
                document.getElementById("score").innerText = countdown + "초...";
                const countdownInterval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        document.getElementById("score").innerText = countdown + "초...";
                    } else {
                        clearInterval(countdownInterval);
                        document.getElementById("score").innerText = "측정중...";

                        // 3. 3초 동안 서버가 센서 데이터를 받고 상대적인 충격량 계산
                        // 화면은 "측정중..."으로 유지
                        counter = 0;
                        pollInterval = setInterval(() => {
                            fetchScore();
                            counter++;
                            if (counter >= 20) { // 20 * 100ms = 2 seconds
                                clearInterval(pollInterval);
                                finalizeMeasurement();
                            }
                        }, 100);
                    }
                }, 1000);
            })
            .catch(err => {
                console.error('Reset failed:', err);
                alert('통신 오류: 리셋 실패');
            });
    }

    let measurementTimeout = null;

    function fetchScore() {
        // 측정 중에는 "측정중..."만 표시 (점수 실시간 표시 방지)
        // 필요 시 디버깅 메시지 추가
        // fetch('/score').then(...)  // 주석 처리로 점수 실시간 확인 안함
        document.getElementById("score").innerText = "측정중...";
    }

    function finalizeMeasurement() {
        // 측정 완료 후 최종 점수 가져오기 및 애니메이션 표시
        fetch('/score')
            .then(response => response.json())
            .then(data => {
                const finalScore = data.score;

                // 점수 카운트업 애니메이션
                animateScore(finalScore);

                // 점수 기록 및 저장 (애니메이션이 끝난 후 처리)
                if (finalScore > 0) {
                    const user_id = localStorage.getItem('user_id');
                    if (user_id) {
                        // 애니메이션 완료 후 저장 및 랭킹 확인 (2초 후)
                        setTimeout(() => {
                            // 점수 저장
                            fetch('/save-score', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ user_id, score: finalScore })
                            })
                            .then(response => response.json())
                            .then(saveData => {
                                console.log('Score saved:', saveData);

                                // 랭킹 확인 및 알림
                                fetch('/rankings')
                                .then(response => response.json())
                                .then(rankingData => {
                                    const rankings = rankingData.rankings;
                                    // 사용자 이름 가져오기
                                    const username = localStorage.getItem('username');

                                    // 현재 사용자의 랭킹 찾기
                                    const userRank = rankings.findIndex(player =>
                                        player.username === username &&
                                        player.best_score === finalScore
                                    );

                                    if (userRank !== -1) {
                                        // 랭킹에 올라갔음
                                        const rank = userRank + 1; // 1-based ranking
                                        alert(`🎉 축하합니다! ${rank}위를 달성했습니다!`);
                                    }
                                })
                                .catch(err => console.error('Ranking check failed:', err));
                            })
                            .catch(err => console.error('Save score failed:', err));
                        }, 2000);
                    }

                    // 로컬 기록에 추가 - 애니메이션 후 처리
                    setTimeout(() => {
                        records.unshift(finalScore);
                        if (records.length > 5) {
                            records = records.slice(0, 5);
                        }
                        updateRecent();
                        updateAverage();
                    }, 2000);
                }
            })
            .catch(err => console.error('Fetch final score failed:', err));
    }

    function animateScore(finalScore) {
        // 0부터 finalScore까지 서서히 올라가는 애니메이션 (약 1.5초)
        let current = 0;
        const increment = finalScore / 30; // 30단계로 나누기
        const duration = 50; // 50ms마다 업데이트

        const timer = setInterval(() => {
            current += increment;
            if (current >= finalScore) {
                current = finalScore;
                clearInterval(timer);
            }
            document.getElementById("score").innerText = Math.round(current) + "p";
        }, duration);
    }

    function stopMeasure() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
            
            // 폴링 멈춘 시점의 점수를 기록에 추가
            const finalScoreText = document.getElementById("score").innerText;
            const finalScore = parseInt(finalScoreText.replace('p', '')) || 0;
            
            if (finalScore > 0) {
                records.unshift(finalScore);
                if (records.length > 5) {
                    records = records.slice(0, 5);
                }
                updateRecent();
                updateAverage();
            }
        }
    }

    function resetMeasure() {
        // Check if currently measuring and stop it completely
        if (measurementTimeout) {
            clearTimeout(measurementTimeout);
            measurementTimeout = null;
        }
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }

        // Reset server state (측정 상태 아예 제거)
        fetch('/reset');

        // Reset local measurements and display
        records = []; // Clear local records array
        updateRecent(); // Update recent measurements display (will show "측정 기록이 없습니다.")
        updateAverage(); // Update records display (will show empty state)

        document.getElementById("score").innerText = "0p";
        // Clear local measurement history
    }

    function updateRecent() {
        const recentEl = document.getElementById("recent");
        
        if (records.length === 0) {
            recentEl.innerText = "측정 기록이 없습니다.";
            recentEl.className = "empty";
            return;
        }
        
        recentEl.innerHTML = records.map((v, i) => `${i + 1}. ${v}p`).join("<br>");
        recentEl.className = "record";
    }

    function updateAverage() {
        const avgEl = document.getElementById("avg");

        if (records.length === 0) {
            avgEl.innerText = "측정 기록이 없습니다.";
            avgEl.className = "empty";
            return;
        }

        const recentBest = Math.max(...records); // Best from recent session records
        const recentAvg = Math.round(records.reduce((a, b) => a + b, 0) / records.length); // Average from recent session

        // Calculate user's overall best and average from all their scores
        const user_id = localStorage.getItem('user_id');

        if (user_id) {
            // Fetch user's personal best and all their scores
            Promise.all([
                fetch('/user-score/' + user_id).then(r => r.json()),
                fetch('/user-scores/' + user_id).then(r => r.json())
            ])
            .then(([userBestData, userScoresData]) => {
                const personalBest = userBestData.score;
                const userScores = userScoresData.scores;

                // Calculate user's overall best (from all scores) and average
                const userOverallBest = userScores.length > 0 ? Math.max(...userScores) : 0;
                const userOverallAverage = userScores.length > 0 ? Math.round(userScores.reduce((a, b) => a + b, 0) / userScores.length) : 0;

                avgEl.innerHTML = `최근 최고점: ${recentBest}p<br>최근 평균: ${recentAvg}p<br>전체 최고점: ${userOverallBest}p<br>전체 평균: ${userOverallAverage}p`;
            })
            .catch(err => {
                console.error('Fetch user history failed:', err);
                avgEl.innerHTML = `최근 최고점: ${recentBest}p<br>최근 평균: ${recentAvg}p<br>전체 최고점: 0p<br>전체 평균: 0p`;
            });
        } else {
            // Not logged in - show zeros
            avgEl.innerHTML = `최근 최고점: ${recentBest}p<br>최근 평균: ${recentAvg}p<br>전체 최고점: 0p<br>전체 평균: 0p`;
        }

        avgEl.className = "record";
    }

    function gomain() {
        window.location.href = "main.html";
    }

    window.startMeasure = startMeasure;
    window.resetMeasure = resetMeasure;
    window.gomain = gomain;
}

// ================= RANKING PAGE =================
if (document.body.classList.contains('ranking-page')) {
    window.addEventListener('DOMContentLoaded', function() {
        loadRankingData();
    });

    function loadRankingData() {
        const user_id = localStorage.getItem('user_id');
        if (user_id) {
            fetch(`/user-score/${user_id}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('userScore').innerText = data.score;
                })
                .catch(err => console.error('Fetch user score failed:', err));
        } else {
            document.getElementById('userScore').innerText = 'XXX';
        }

        fetch('/rankings')
            .then(response => response.json())
            .then(data => {
                const rankings = data.rankings.slice(0, 10);
                for (let i = 0; i < 10; i++) {
                    if (rankings[i]) {
                        document.getElementById(`rank${i + 1}Name`).innerText = rankings[i].username;
                        document.getElementById(`rank${i + 1}Score`).innerText = rankings[i].best_score + 'p';
                    } else {
                        // Clear rankings beyond available data
                        const nameEl = document.getElementById(`rank${i + 1}Name`);
                        const scoreEl = document.getElementById(`rank${i + 1}Score`);
                        if (nameEl) nameEl.innerText = '';
                        if (scoreEl) scoreEl.innerText = '';
                    }
                }
            })
            .catch(err => console.error('Fetch rankings failed:', err));
    }

    function gomain() {
        window.location.href = "main.html";
    }

    window.gomain = gomain;
}
