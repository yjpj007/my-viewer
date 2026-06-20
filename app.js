(function() {
    // -------------------- 缓存常用DOM元素 --------------------
    const particleCanvas = document.getElementById('particleCanvas');
    const ctx = particleCanvas.getContext('2d');
    let particles = [], PARTICLE_COUNT = 100, isPageVisible = true, lastFrameTime = 0;

    function resizeCanvas() { 
        particleCanvas.width = window.innerWidth; 
        particleCanvas.height = window.innerHeight; 
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() { this.reset(true); }
        reset(initial) {
            this.x = Math.random() * particleCanvas.width;
            this.y = Math.random() * particleCanvas.height;
            const angle = Math.random() * Math.PI * 2, speed = 0.4 + Math.random() * 1.8;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            this.size = 0.4 + Math.random() * 2.2;
            this.opacity = 0.3 + Math.random() * 0.7;
            this.color = Math.random() > 0.35 ? 'rgba(0,220,255,' : 'rgba(200,180,255,';
            this.twinkleSpeed = 0.01 + Math.random() * 0.03;
            this.twinkleOffset = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x < -20 || this.x > particleCanvas.width + 20 || this.y < -20 || this.y > particleCanvas.height + 20) 
                this.reset();
            this.twinkleOffset += this.twinkleSpeed;
        }
        draw(ctx) {
            const currentOpacity = this.opacity * (0.55 + 0.45 * Math.sin(this.twinkleOffset));
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fillStyle = this.color + currentOpacity + ')'; 
            ctx.fill();
            if (this.size > 1.5 && currentOpacity > 0.5) {
                ctx.beginPath(); 
                ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI*2);
                ctx.fillStyle = this.color + (currentOpacity * 0.2) + ')'; 
                ctx.fill();
            }
        }
    }
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function animateParticles(timestamp) {
        if (!isPageVisible) { requestAnimationFrame(animateParticles); return; }
        if (timestamp - lastFrameTime < 33) { requestAnimationFrame(animateParticles); return; }
        lastFrameTime = timestamp;
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        const centerX = particleCanvas.width / 2, centerY = particleCanvas.height / 2;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 180);
        gradient.addColorStop(0, 'rgba(0,200,255,0.04)'); 
        gradient.addColorStop(0.5, 'rgba(100,0,200,0.02)'); 
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient; 
        ctx.fillRect(0, 0, particleCanvas.width, particleCanvas.height);
        for (const p of particles) { p.update(); p.draw(ctx); }
        requestAnimationFrame(animateParticles);
    }
    requestAnimationFrame(animateParticles);
    document.addEventListener('visibilitychange', () => { isPageVisible = !document.hidden; });

    // -------------------- 工具函数 --------------------
    const escapeHtml = (str) => {
        if (str == null) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };
    
    const getLocalDateString = (date = new Date()) => {
        const d = new Date(date);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    const getDateRange = (startDateStr, endDateStr) => {
        const end = new Date(endDateStr + 'T00:00:00');
        end.setDate(end.getDate() + 1);
        const endNextStr = end.getFullYear() + '-' + String(end.getMonth() + 1).padStart(2, '0') + '-' + String(end.getDate()).padStart(2, '0');
        return { start: startDateStr, end: endNextStr };
    };

    // -------------------- Supabase 配置 --------------------
    const SUPABASE_URL = "https://gbedtcwsnwteneiokizp.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_6kqvIXFMeqXW-xmwh7GcHQ_LvfH2zon";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const SUPER_ADMIN_EMAIL = "liuping@vip.com";
    const PAGE_SIZE = 50;
    const SUPER_ADMIN_SECRET = '413335259';

    // -------------------- 全局状态与缓存元素 --------------------
    let currentStartDate = getLocalDateString();
    let currentEndDate = getLocalDateString();
    let currentFilterStncode = '';
    let currentSort = { col: null, asc: true };
    let currentPage = 1;
    let totalRows = 0;
    let currentPageData = [];
    let activeAbortController = null;
    let statsAbortController = null;
    let cachedTodayCount = null;
    let showHistoricalTotal = false;
    let currentRangeAggregates = [];
    let fullSortedData = [];

    // 缓存主面板DOM元素
    const getEl = (id) => document.getElementById(id);

    // -------------------- UI 辅助函数 --------------------
    const showToast = (message, type = 'error') => {
        let container = getEl('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        if (container.children.length >= 3) container.removeChild(container.firstChild);
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 5000);
    };

    const showLoading = (msg = '加载中...') => {
        let overlay = getEl('globalLoading');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'globalLoading';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div><div style="color:white; font-size:14px;" id="loadingMsg">' + escapeHtml(msg) + '</div>';
            document.body.appendChild(overlay);
        } else getEl('loadingMsg').textContent = msg;
        overlay.style.display = 'flex';
    };

    const hideLoading = () => {
        const el = getEl('globalLoading');
        if (el) el.style.display = 'none';
    };

    const showProgress = (message = '正在加载数据...') => {
        let overlay = getEl('progressOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'progressOverlay';
            overlay.className = 'progress-overlay';
            overlay.innerHTML = `<div class="progress-container"><div class="progress-message" id="progressMsg">${escapeHtml(message)}</div><div class="progress-bar-bg"><div class="progress-bar-fill" id="progressBarFill"></div></div><div class="progress-percent" id="progressPercent">0%</div></div>`;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        let currentProgress = 0;
        const timer = setInterval(() => {
            if (currentProgress < 90) {
                currentProgress += Math.random() * 3 + 1;
                if (currentProgress > 90) currentProgress = 90;
            } else {
                currentProgress += Math.random() * 0.5;
                if (currentProgress > 95) currentProgress = 95;
            }
            getEl('progressBarFill').style.width = currentProgress + '%';
            getEl('progressPercent').textContent = Math.floor(currentProgress) + '%';
        }, 300);
        return {
            finish: () => {
                clearInterval(timer);
                getEl('progressBarFill').style.width = '100%';
                getEl('progressPercent').textContent = '100%';
                setTimeout(() => { overlay.style.display = 'none'; }, 300);
            },
            hide: () => {
                clearInterval(timer);
                getEl('progressBarFill').style.width = '100%';
                getEl('progressPercent').textContent = '100%';
                setTimeout(() => { overlay.style.display = 'none'; }, 200);
            }
        };
    };

    const startClock = () => {
        const clockEl = getEl('liveClock');
        if (!clockEl) return;
        const update = () => {
            const now = new Date();
            const timeStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = '⏱ ' + timeStr;
        };
        update();
        setInterval(update, 1000);
    };

    const createAbortController = (forStats = false) => {
        if (forStats) {
            if (statsAbortController) statsAbortController.abort();
            statsAbortController = new AbortController();
            return statsAbortController;
        } else {
            if (activeAbortController) activeAbortController.abort();
            activeAbortController = new AbortController();
            return activeAbortController;
        }
    };

    // -------------------- 数据获取 --------------------
    const fetchAllLogsForRange = async (startDate, endDate, filterStncode, signal) => {
        const range = getDateRange(startDate, endDate);
        let allData = [];
        let lastCreatedAt = null;
        const pageSize = 1000;

        while (true) {
            let query = supabase.from('request_logs')
                .select('created_at, request_body')
                .gte('created_at', range.start)
                .lt('created_at', range.end)
                .order('created_at', { ascending: false })
                .limit(pageSize);

            if (filterStncode) query = query.filter('request_body->>stncode', 'eq', filterStncode);
            if (signal) query = query.abortSignal(signal);
            if (lastCreatedAt) query = query.lt('created_at', lastCreatedAt);

            const { data, error } = await query;
            if (error) throw error;
            if (!data || data.length === 0) break;

            allData = allData.concat(data);
            if (data.length < pageSize) break;

            lastCreatedAt = data[data.length - 1].created_at;
        }
        return allData;
    };

    const aggregateByStation = (data) => {
        const map = {};
        for (const row of data) {
            const stncode = row.request_body?.stncode;
            if (stncode) map[stncode] = (map[stncode] || 0) + 1;
        }
        return Object.entries(map).map(([stncode, count]) => ({ stncode, count }));
    };

    const loadStats = async (signal) => {
        const today = getLocalDateString();
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrow = getLocalDateString(tomorrowDate);

        let allTimeQuery = supabase.from('request_logs').select('*', { count: 'exact', head: true });
        if (currentFilterStncode) allTimeQuery = allTimeQuery.filter('request_body->>stncode', 'eq', currentFilterStncode);
        const { count: allCount } = await allTimeQuery.abortSignal(signal);
        getEl('totalCountBack').innerText = allCount || 0;

        getEl('totalCountFront').innerText = totalRows;

        let todayQuery = supabase.from('request_logs').select('*', { count: 'exact', head: true })
            .gte('created_at', today).lt('created_at', tomorrow);
        if (currentFilterStncode) todayQuery = todayQuery.filter('request_body->>stncode', 'eq', currentFilterStncode);
        todayQuery = todayQuery.abortSignal(signal);
        const { count } = await todayQuery;
        cachedTodayCount = count || 0;
        getEl('todayCount').innerText = cachedTodayCount;
    };

    const loadRangeData = async (silent = false) => {
        if (!silent) showLoading('加载数据中...');
        const controller = createAbortController();
        const statsController = createAbortController(true);
        const signal = controller.signal;
        const statsSignal = statsController.signal;

        try {
            const allData = await fetchAllLogsForRange(currentStartDate, currentEndDate, currentFilterStncode, signal);
            fullSortedData = [...allData];
            if (currentSort.col !== null) sortDataInPlace(fullSortedData, currentSort.col, currentSort.asc);

            totalRows = fullSortedData.length;
            const from = (currentPage - 1) * PAGE_SIZE;
            currentPageData = fullSortedData.slice(from, from + PAGE_SIZE);
            currentRangeAggregates = aggregateByStation(fullSortedData);

            renderTable(currentPageData);
            renderSummary();

            loadStats(statsSignal).catch(e => console.error('统计加载失败:', e));
            updateTodayTasks().catch(e => console.error(e));
        } catch (err) {
            if (err.name === 'AbortError') return;
            getEl('dataError').innerHTML = `${escapeHtml('数据加载失败：' + err.message)} <button class="retry-btn" id="retryRangeBtn">重试</button>`;
            getEl('retryRangeBtn').addEventListener('click', () => {
                getEl('dataError').innerHTML = '';
                loadRangeData();
            });
        } finally {
            if (controller) controller.abort();
            if (!silent) hideLoading();
        }
    };

    const sortDataInPlace = (data, colIndex, ascending) => {
        if (colIndex === 8) {
            data.sort((a, b) => {
                const valA = a.created_at || '';
                const valB = b.created_at || '';
                return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        } else {
            data.sort((a, b) => {
                const bodyA = a.request_body, bodyB = b.request_body;
                let valA, valB;
                switch (colIndex) {
                    case 0: valA = bodyA?.stncode || ''; valB = bodyB?.stncode || ''; break;
                    case 1: valA = bodyA?.shortname || ''; valB = bodyB?.shortname || ''; break;
                    case 2: valA = bodyA?.saleno || ''; valB = bodyB?.saleno || ''; break;
                    case 3: valA = bodyA?.gname || ''; valB = bodyB?.gname || ''; break;
                    case 4: valA = bodyA?.mobilephone || ''; valB = bodyB?.mobilephone || ''; break;
                    case 5: valA = bodyA?.name || ''; valB = bodyB?.name || ''; break;
                    case 6: valA = bodyA?.ctc || ''; valB = bodyB?.ctc || ''; break;
                    case 7: valA = bodyA?.ttc || ''; valB = bodyB?.ttc || ''; break;
                    case 9: valA = bodyA?.questiondata?.length ? bodyA.questiondata[bodyA.questiondata.length - 1].answercontent : ''; 
                            valB = bodyB?.questiondata?.length ? bodyB.questiondata[bodyB.questiondata.length - 1].answercontent : ''; 
                            break;
                    default: return 0;
                }
                if (valA < valB) return ascending ? -1 : 1;
                if (valA > valB) return ascending ? 1 : -1;
                return 0;
            });
        }
    };

    const updateTodayTasks = async () => {
        const tasksEl = getEl('todayTasks');
        if (!tasksEl) return;
        try {
            const today = getLocalDateString();
            const { data, error } = await supabase.from('stations').select('startdate, enddate, count');
            if (error) throw error;
            let total = 0;
            for (const station of (data || [])) {
                const start = station.startdate?.slice(0, 10);
                const end = station.enddate?.slice(0, 10);
                if (start && end && start <= today && today <= end) total += station.count || 0;
            }
            tasksEl.innerText = total;
        } catch (err) {
            console.error('获取今日任务失败:', err);
            tasksEl.innerText = '!';
        }
    };

    // -------------------- 渲染函数 --------------------
    const renderSummary = () => {
        const validItems = currentRangeAggregates.filter(item => item.stncode);
        const items = validItems.map(({ stncode, count }) =>
            `${escapeHtml(stncode)}: <span style="color:var(--success);font-weight:bold;">${count}次</span>`
        ).join(' | ');
        const rangeLabel = currentStartDate === currentEndDate ? currentStartDate : `${currentStartDate} ~ ${currentEndDate}`;
        getEl('summaryInline').innerHTML = items
            ? `站点评论次数 (${rangeLabel})：${items}`
            : `站点评论次数 (${rangeLabel})：无`;
    };

    const sortTable = (colIndex) => {
        if (currentSort.col === colIndex) currentSort.asc = !currentSort.asc;
        else { currentSort.col = colIndex; currentSort.asc = true; }
        currentPage = 1;
        loadRangeData();
    };

    const renderTable = (data) => {
        const tbody = getEl('tableBody'), emptyMsg = getEl('emptyMessage');
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            emptyMsg.style.display = 'block';
            renderPagination(0);
            return;
        }
        emptyMsg.style.display = 'none';
        const fragment = document.createDocumentFragment();
        for (const row of data) {
            const body = row.request_body;
            const tr = document.createElement('tr');
            const values = [
                body?.stncode, body?.shortname, body?.saleno, body?.gname, body?.mobilephone, body?.name,
                body?.ctc, body?.ttc, 
                row.created_at ? row.created_at.substring(0, 19).replace('T', ' ') : '',
                (body?.questiondata?.length ? body.questiondata[body.questiondata.length - 1].answercontent : '')
            ];
            for (const v of values) {
                const td = document.createElement('td');
                td.textContent = v || '';
                if (v && v.length > 15) td.title = v;
                tr.appendChild(td);
            }
            fragment.appendChild(tr);
        }
        tbody.appendChild(fragment);
        renderPagination(Math.ceil(totalRows / PAGE_SIZE));
    };

    const renderPagination = (totalPages) => {
        const bar = getEl('paginationBar');
        bar.innerHTML = '';
        if (totalPages <= 1) return;
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '上一页';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadRangeData(); } });
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '下一页';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; loadRangeData(); } });
        const span = document.createElement('span');
        span.textContent = `${currentPage} / ${totalPages}`;
        bar.appendChild(prevBtn);
        bar.appendChild(span);
        bar.appendChild(nextBtn);
    };

    const applyFilter = () => {
        currentFilterStncode = getEl('stncodeFilter').value.trim();
        currentPage = 1;
        loadRangeData();
    };

    const resetFilter = () => {
        getEl('stncodeFilter').value = '';
        currentFilterStncode = '';
        currentPage = 1;
        loadRangeData();
    };

    const onRangeChange = () => {
        const startEl = getEl('startDateSelect');
        const endEl = getEl('endDateSelect');
        if (!startEl || !endEl) return;
        currentStartDate = startEl.value;
        currentEndDate = endEl.value;
        if (!currentStartDate || !currentEndDate) return;
        if (currentStartDate > currentEndDate) {
            showToast('开始日期不能晚于结束日期');
            endEl.value = currentStartDate;
            currentEndDate = currentStartDate;
        }
        currentPage = 1;
        currentSort = { col: null, asc: true };
        loadRangeData();
    };

    // -------------------- 界面构建 --------------------
    const buildUI = () => {
        const app = getEl('app');
        app.innerHTML = '';

        // 登录区域
        const loginSec = document.createElement('div');
        loginSec.id = 'loginSection';
        loginSec.innerHTML = `
        <div class="login-wrapper">
            <div class="login-aura"></div><div class="login-geom-ring"></div><div class="login-geom-ring"></div>
            <div class="login-box">
                <h3>数据中心</h3><div class="login-subtitle">INTELLIGENT MANAGEMENT</div>
                <div class="login-input-group"><input type="email" id="email" placeholder="邮箱地址" required autocomplete="email"></div>
                <div class="login-input-group"><div class="password-wrapper"><input type="password" id="password" placeholder="密码" required autocomplete="off"><button class="password-toggle" id="togglePwd" type="button" title="显示密码">👁️</button></div></div>
                <div class="remember-row"><input type="checkbox" id="rememberMe"><label for="rememberMe">记住账号</label></div>
                <button type="button" id="loginBtn" class="login-submit-btn">进入系统</button>
                <p id="loginError" class="error"></p>
            </div>
        </div>`;
        app.appendChild(loginSec);

        // 数据面板
        const dataSec = document.createElement('div');
        dataSec.id = 'dataSection';
        dataSec.style.display = 'none';
        dataSec.innerHTML = `
        <div class="header"><div class="title" id="pageTitle"><span>数据中心欢迎您</span> <span class="user-email-in-title"></span></div><div style="display:flex;gap:8px;flex-wrap:wrap;" id="adminButtonGroup"><button id="adminBtn" class="admin-btn" style="display:none;">用户管理</button><button id="configBtn" class="config-btn" style="display:none;">站点数据配置</button><button id="logoutBtn" class="logout-btn">退出登录</button></div></div>
        <div class="top-bar">
            <div class="stat-card" id="totalCard">
                <div class="flip-card">
                    <div class="flip-card-front"><div class="label">区间评论总数</div><div class="number" id="totalCountFront">-</div></div>
                    <div class="flip-card-back"><div class="label">历史-评论总数</div><div class="number" id="totalCountBack">-</div></div>
                </div>
            </div>
            <div class="stat-card" id="todayCard">
                <div class="flip-card">
                    <div class="flip-card-front"><div class="label">今日评论数</div><div class="number" id="todayCount">-</div></div>
                    <div class="flip-card-back"><div class="label">本日任务</div><div class="number" id="todayTasks">-</div></div>
                </div>
            </div>
            <div class="date-range-card" id="dateRangeCard">
                <div class="date-row"><label for="startDateSelect">开始</label><input type="date" id="startDateSelect" value="${currentStartDate}"></div>
                <div class="date-row"><label for="endDateSelect">结束</label><input type="date" id="endDateSelect" value="${currentEndDate}"></div>
            </div>
        </div>
        <div class="filter-bar"><div class="filter-input"><label for="stncodeFilter">📍 站点编码 <span class="live-clock" id="liveClock"></span></label><input type="text" id="stncodeFilter" placeholder="输入站点编码 (例如 33300011)"></div><button id="applyFilterBtn">🔍 查询</button><button id="resetFilterBtn">🔄 重置</button></div>
        <div class="summary-inline" id="summaryInline">加载中...</div>
        <div class="table-fixed-header"><div class="thead-container" id="theadContainer"><table id="headerTable"><thead id="tableHead"></thead></table></div><div class="tbody-container" id="tbodyContainer"><table id="dataTable"><tbody id="tableBody"></tbody></table><div class="empty-state" id="emptyMessage" style="display:none;">所选区间暂无评论数据</div></div></div>
        <div class="pagination-bar" id="paginationBar"></div><p id="dataError" class="error"></p>`;
        app.appendChild(dataSec);

        // 表格头部
        const thead = getEl('tableHead');
        const tr = document.createElement('tr');
        ['站点编码','站点简称','销售单号','油品名称','手机号','姓名','CTC','TTC','提交时间','评价内容'].forEach((h, idx) => {
            const th = document.createElement('th');
            th.textContent = h;
            th.dataset.colIndex = idx;
            th.addEventListener('click', () => sortTable(idx));
            tr.appendChild(th);
        });
        thead.appendChild(tr);

        // 滚动同步
        const tbodyContainer = getEl('tbodyContainer');
        const theadContainer = getEl('theadContainer');
        tbodyContainer.addEventListener('scroll', () => {
            theadContainer.scrollLeft = tbodyContainer.scrollLeft;
        });

        // 时钟
        startClock();

        // 翻转卡片
        const totalCard = getEl('totalCard');
        totalCard.addEventListener('click', () => {
            showHistoricalTotal = !showHistoricalTotal;
            totalCard.classList.toggle('flipped', showHistoricalTotal);
        });
        const todayCard = getEl('todayCard');
        todayCard.addEventListener('click', () => todayCard.classList.toggle('flipped'));

        // 日期与筛选事件
        getEl('startDateSelect').addEventListener('change', onRangeChange);
        getEl('endDateSelect').addEventListener('change', onRangeChange);
        getEl('applyFilterBtn').addEventListener('click', applyFilter);
        getEl('resetFilterBtn').addEventListener('click', resetFilter);
        getEl('stncodeFilter').addEventListener('input', function(e) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(applyFilter, 300);
        });
    };

    const showLogin = () => {
        getEl('loginSection').style.display = 'flex';
        getEl('dataSection').style.display = 'none';
        const savedEmail = localStorage.getItem('supabase_saved_email');
        if (savedEmail) {
            getEl('email').value = savedEmail;
            getEl('rememberMe').checked = true;
        }
        getEl('password').value = '';
    };

    const getCurrentUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        if (user.email === SUPER_ADMIN_EMAIL) return 'super_admin';
        if (user.user_metadata?.role === 'admin') return 'admin';
        return 'user';
    };

    const showData = async () => {
        getEl('loginSection').style.display = 'none';
        getEl('dataSection').style.display = 'block';
        currentFilterStncode = '';
        getEl('stncodeFilter').value = '';
        currentStartDate = getLocalDateString();
        currentEndDate = getLocalDateString();
        getEl('startDateSelect').value = currentStartDate;
        getEl('endDateSelect').value = currentEndDate;

        const progress = showProgress('正在加载数据...');
        try {
            if (currentStartDate && currentEndDate) {
                await loadRangeData(false);
                await updateTodayTasks();
            }
            await new Promise(r => setTimeout(r, 200));
            progress.finish();
        } catch (err) {
            progress.hide();
            getEl('dataError').innerHTML = `${escapeHtml('系统异常：' + err.message)} <button class="retry-btn" id="retryLoadBtn">重试</button>`;
            getEl('retryLoadBtn').addEventListener('click', () => {
                getEl('dataError').innerHTML = '';
                showData();
            });
            return;
        }
        await updateUIByRole();
        await updateTitleWithUser();
    };

    const updateTitleWithUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const titleEl = getEl('pageTitle');
        if (titleEl && user) {
            const emailSpan = titleEl.querySelector('.user-email-in-title');
            if (emailSpan) emailSpan.textContent = `(${user.email})`;
        }
    };

    const login = async () => {
        const btn = getEl('loginBtn');
        const errEl = getEl('loginError');
        const email = getEl('email').value.trim();
        const password = getEl('password').value;
        errEl.textContent = '';
        if (!email || !password) { errEl.textContent = '请输入邮箱和密码'; return; }
        if (!email.includes('@')) { errEl.textContent = '邮箱格式不正确'; return; }
        btn.disabled = true; btn.textContent = '验证中...'; showLoading('正在登录...');
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (getEl('rememberMe').checked) localStorage.setItem('supabase_saved_email', email);
            else localStorage.removeItem('supabase_saved_email');
            getEl('password').value = '';
            hideLoading(); btn.textContent = '进入系统'; btn.disabled = false;
            await showData();
        } catch (err) {
            hideLoading();
            errEl.textContent = '系统异常：' + (err.message || '未知错误');
            btn.disabled = false; btn.textContent = '进入系统';
            getEl('password').value = '';
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        showLogin();
        currentStartDate = getLocalDateString();
        currentEndDate = getLocalDateString();
        currentFilterStncode = '';
        currentSort = { col: null, asc: true };
        currentPage = 1;
        totalRows = 0;
        currentPageData = [];
        cachedTodayCount = null;
        currentRangeAggregates = [];
        fullSortedData = [];
    };

    const updateUIByRole = async () => {
        const role = await getCurrentUserRole();
        const isSuperAdmin = (role === 'super_admin');
        getEl('adminBtn').style.display = isSuperAdmin ? 'inline-block' : 'none';
        getEl('configBtn').style.display = isSuperAdmin ? 'inline-block' : 'none';
    };

    // -------------------- 用户管理、站点配置等（保持完整，与前文一致） --------------------
    // ... 省略以节省篇幅，实际使用时请将之前提供的完整函数体粘贴在此处 ...
    // 包括：showAdminPanel, batchCreateAccounts, parseFuelMappings, serializeFuelMappings,
    // FuelMappingEditor, CardnoEditor, showStationConfig 及相关辅助函数。
    // 因篇幅过长，这里不重复展开，但确保完整复制即可。

    // -------------------- 绑定事件 --------------------
    const bindEvents = () => {
        getEl('loginBtn').addEventListener('click', login);
        getEl('logoutBtn').addEventListener('click', logout);
        getEl('togglePwd').addEventListener('click', () => {
            const pwd = getEl('password'), btn = getEl('togglePwd');
            if (pwd.type === 'password') { pwd.type = 'text'; btn.innerHTML = '🙈'; }
            else { pwd.type = 'password'; btn.innerHTML = '👁️'; }
        });
        getEl('adminBtn').addEventListener('click', showAdminPanel);
        getEl('configBtn').addEventListener('click', showStationConfig);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && getEl('loginSection').style.display !== 'none') {
                const loginBtn = getEl('loginBtn');
                if (loginBtn && !loginBtn.disabled) login();
            }
        });
    };

    buildUI();
    bindEvents();
    (async function init() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-')) keysToRemove.push(key);
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        try { await supabase.auth.signOut(); } catch (e) {}
        showLogin();
    })();
})();