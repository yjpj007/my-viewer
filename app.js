// =======================================
(function() {
    
    document.oncontextmenu = function(e) {
        e.preventDefault();
        return false;
    };

    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') || 
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            window.location.href = 'about:blank';
        }
    });

    
    var widthThreshold = 160;
    var heightThreshold = 160;
    var isInputActive = false;

    
    document.addEventListener('focusin', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            isInputActive = true;
        }
    });
    document.addEventListener('focusout', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            isInputActive = false;
        }
    });

    
    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function detectDevTools() {
        if (isInputActive) return;          
        if (isMobileDevice()) return;       
        var widthDiff = window.outerWidth - window.innerWidth;
        var heightDiff = window.outerHeight - window.innerHeight;
        if (widthDiff > widthThreshold || heightDiff > heightThreshold) {
            window.location.href = 'about:blank';
        }
    }
    setInterval(detectDevTools, 1000);

    
    function detectMobileInjection() {
        
        if (document.querySelector('.eruda-container') || document.querySelector('#__vconsole') || window.eruda || window.vConsole) {
            document.body.innerHTML = '';
            window.location.href = 'about:blank';
        }
    }

    function detectDebuggerAttach() {
        
        var start = performance.now();
        (function(){}).constructor('debugger')();
        var end = performance.now();
        if (end - start > 50) {
            window.location.href = 'about:blank';
        }
    }

    function detectAutomation() {
        if (navigator.webdriver || window.Cypress) {
            window.location.href = 'about:blank';
        }
    }

    
    setInterval(function() {
        detectMobileInjection();
        detectDebuggerAttach();
        detectAutomation();
    }, 2500);

    // 5. 劫持 Console (暂时注释，防止某些浏览器报错导致白屏)
    // var originalConsoleLog = console.log;
    // console.log = function() { /* 静默拦截 */ };
    // console.warn = function() { /* 静默拦截 */ };
    // console.error = function() { /* 静默拦截 */ };

    // 6. 无限 Debugger 陷阱 (已注释，防止白屏)
    // (function boobytrap() {
    //     (function() {
    //         return false;
    //     }).constructor('debugger')();
    //     setTimeout(boobytrap, 3000);
    // })();
})();
// =======================================

(function() {
    // ---------------------------------------
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

    // ----------------------------------------
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

    // --------------------------------------
    const SUPABASE_URL = "https://gbedtcwsnwteneiokizp.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_6kqvIXFMeqXW-xmwh7GcHQ_LvfH2zon";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const SUPER_ADMIN_EMAIL = "liuping@vip.com";
    const PAGE_SIZE = 50;
    

    // ----------------------------------------
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

    const getEl = (id) => document.getElementById(id);

    // ----------------------------------------
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

    // ========================================
    const fetchTotalCount = async (startDate, endDate, filterStncode, signal) => {
        const range = getDateRange(startDate, endDate);
        let query = supabase.from('request_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', range.start)
            .lt('created_at', range.end);
        if (filterStncode) query = query.filter('request_body->>stncode', 'eq', filterStncode);
        if (signal) query = query.abortSignal(signal);
        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
    };

    const fetchPageData = async (startDate, endDate, filterStncode, sortCol, asc, page, signal) => {
        const range = getDateRange(startDate, endDate);
        const offset = (page - 1) * PAGE_SIZE;
        let query = supabase.from('request_logs')
            .select('created_at, request_body')
            .gte('created_at', range.start)
            .lt('created_at', range.end)
            .range(offset, offset + PAGE_SIZE - 1);

        const colMap = {
            0: 'request_body->>stncode',
            1: 'request_body->>shortname',
            2: 'request_body->>saleno',
            3: 'request_body->>gname',
            4: 'request_body->>mobilephone',
            5: 'request_body->>name',
            6: 'request_body->>ctc',
            7: 'request_body->>ttc',
            8: 'created_at',
            9: 'created_at'
        };
        let orderCol = 'created_at';
        if (sortCol !== null && colMap[sortCol]) {
            orderCol = colMap[sortCol];
        }
        query = query.order(orderCol, { ascending: asc });

        if (filterStncode) query = query.filter('request_body->>stncode', 'eq', filterStncode);
        if (signal) query = query.abortSignal(signal);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    };

    const fetchAggregate = async (startDate, endDate, filterStncode, signal) => {
        const range = getDateRange(startDate, endDate);
        let params = {
            start_date: range.start,
            end_date: range.end,
            filter_stncode: filterStncode || null
        };
        const { data, error } = await supabase.rpc('get_station_counts', params).abortSignal(signal);
        if (error) throw error;
        return data || [];
    };

    const loadRangeData = async (silent = false) => {
        if (!silent) showLoading('加载数据中...');
        const controller = createAbortController();
        const statsController = createAbortController(true);
        const signal = controller.signal;
        const statsSignal = statsController.signal;

        try {
            const [total, pageData, aggregates] = await Promise.all([
                fetchTotalCount(currentStartDate, currentEndDate, currentFilterStncode, signal),
                fetchPageData(currentStartDate, currentEndDate, currentFilterStncode, 
                              currentSort.col, currentSort.asc, currentPage, signal),
                fetchAggregate(currentStartDate, currentEndDate, currentFilterStncode, statsSignal)
            ]);

            totalRows = total;
            currentPageData = pageData;
            currentRangeAggregates = aggregates.map(item => ({ stncode: item.stncode, count: Number(item.count) }));

            renderTable(currentPageData);
            renderSummary();

            await loadStats(statsSignal).catch(e => console.error('统计加载失败:', e));
            await updateTodayTasks().catch(e => console.error(e));
        } catch (err) {
            if (err.name === 'AbortError') return;
            getEl('dataError').innerHTML = `${escapeHtml('数据加载失败：' + err.message)} <button class="retry-btn" id="retryRangeBtn">重试</button>`;
            const retryBtn = document.getElementById('retryRangeBtn');
            if (retryBtn) {
                retryBtn.replaceWith(retryBtn.cloneNode(true));
                document.getElementById('retryRangeBtn').addEventListener('click', () => {
                    getEl('dataError').innerHTML = '';
                    loadRangeData();
                });
            }
        } finally {
            if (controller) controller.abort();
            if (statsController) statsController.abort();
            if (!silent) hideLoading();
        }
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

    const updateTodayTasks = async () => {
        const tasksEl = getEl('todayTasks');
        if (!tasksEl) return;
        try {
            const today = getLocalDateString();
            const { data, error } = await supabase.from('stations').select('count').lte('startdate', today).gte('enddate', today);
            if (error) throw error;
            const total = (data || []).reduce((sum, item) => sum + (item.count || 0), 0);
            tasksEl.innerText = total;
        } catch (err) {
            console.error('获取今日任务失败:', err);
            tasksEl.innerText = '!';
        }
    };

    // -------------------------------------
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
        
        const dataTable = getEl('dataTable');
        let colgroup = dataTable.querySelector('colgroup');
        if (!colgroup) {
            colgroup = document.createElement('colgroup');
            dataTable.prepend(colgroup);
        }
        colgroup.innerHTML = `
            <col style="width: 120px; min-width: 120px;">
            <col style="width: 140px; min-width: 140px;">
            <col style="width: 150px; min-width: 150px;">
            <col style="width: 140px; min-width: 140px;">
            <col style="width: 130px; min-width: 130px;">
            <col style="width: 100px; min-width: 100px;">
            <col style="width: 80px; min-width: 80px;">
            <col style="width: 80px; min-width: 80px;">
            <col style="width: 190px; min-width: 190px;">
            <col style="width: 300px; min-width: 300px;">
        `;

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

    // -------------------- -------------------
    const buildUI = () => {
        const app = getEl('app');
        app.innerHTML = '';

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

        const dataSec = document.createElement('div');
        dataSec.id = 'dataSection';
        dataSec.style.display = 'none';
        dataSec.innerHTML = `
        <div class="header"><div class="title" id="pageTitle"><span>数据中心欢迎您</span> <span class="user-email-in-title"></span></div><div style="display:flex;gap:8px;flex-wrap:wrap;" id="adminButtonGroup"><button id="adminBtn" class="admin-btn" style="display:none;">用户管理</button><button id="configBtn" class="config-btn" style="display:none;">站点数据配置</button><button id="headerCalcTrigger" class="calc-btn">🧮 费用</button><button id="logoutBtn" class="logout-btn">退出登录</button></div></div>
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

        const calcPopup = document.createElement('div');
        calcPopup.id = 'calcPopup';
        calcPopup.className = 'calc-popup';
        calcPopup.style.display = 'none';
        calcPopup.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-right:20px;">
                <span style="font-weight:bold; color:var(--neon-blue);">💰 费用预测计算器</span>
                <span class="calc-popup-close" id="calcPopupClose">&times;</span>
            </div>
            <div class="field-row"><label>每日数量</label><input type="number" id="calcDaily" value="300" min="0"></div>
            <div class="field-row"><label>开始日期</label><input type="date" id="calcStart"></div>
            <div class="field-row"><label>持续天数</label><input type="number" id="calcDays" value="5" min="0"></div>
            <div class="field-row"><label>本月已评数</label><input type="number" id="calcUsed" value="0" min="0"></div>

            <div class="calc-results-area">
                <div class="calc-result-end-row">
                    <label>预计结束日期</label>
                    <span id="calcEnd" style="color:var(--neon-blue);">-</span>
                </div>
                <div class="calc-divider"></div>
                <div class="calc-result-stats-row">
                    <div class="calc-stat-item">
                        <label>本次数量</label>
                        <span id="calcTotal" class="calc-val-neon">-</span>
                    </div>
                    <div class="calc-stat-item">
                        <label>预计费用 (全价)</label>
                        <span id="calcFeeFull" class="calc-val-success">-</span>
                    </div>
                    <div class="calc-stat-item">
                        <label>实际费用 (阶梯)</label>
                        <span id="calcFeeActual" class="calc-val-danger">-</span>
                    </div>
                </div>
            </div>
        `;
        app.appendChild(calcPopup);

        const headerTable = getEl('headerTable');
        const colgroupHeader = document.createElement('colgroup');
        colgroupHeader.innerHTML = `
            <col style="width: 120px; min-width: 120px;">
            <col style="width: 140px; min-width: 140px;">
            <col style="width: 150px; min-width: 150px;">
            <col style="width: 140px; min-width: 140px;">
            <col style="width: 130px; min-width: 130px;">
            <col style="width: 100px; min-width: 100px;">
            <col style="width: 80px; min-width: 80px;">
            <col style="width: 80px; min-width: 80px;">
            <col style="width: 190px; min-width: 190px;">
            <col style="width: 300px; min-width: 300px;">
        `;
        headerTable.prepend(colgroupHeader);

        const thead = getEl('tableHead');
        const tr = document.createElement('tr');
        const headers = ['站点编码','站点简称','销售单号','油品名称','手机号','姓名','CTC','TTC','提交时间','评价内容'];
        
        headers.forEach((h, idx) => {
            const th = document.createElement('th');
            th.textContent = h;
            th.dataset.colIndex = idx;
            th.addEventListener('click', () => sortTable(idx));
            tr.appendChild(th);
        });
        thead.appendChild(tr);

        const tbodyContainer = getEl('tbodyContainer');
        const theadContainer = getEl('theadContainer');
        tbodyContainer.addEventListener('scroll', () => {
            theadContainer.scrollLeft = tbodyContainer.scrollLeft;
        });

        startClock();

        const totalCard = getEl('totalCard');
        totalCard.addEventListener('click', () => {
            showHistoricalTotal = !showHistoricalTotal;
            totalCard.classList.toggle('flipped', showHistoricalTotal);
        });
        const todayCard = getEl('todayCard');
        todayCard.addEventListener('click', () => todayCard.classList.toggle('flipped'));

        getEl('startDateSelect').addEventListener('change', onRangeChange);
        getEl('endDateSelect').addEventListener('change', onRangeChange);
        getEl('applyFilterBtn').addEventListener('click', applyFilter);
        getEl('resetFilterBtn').addEventListener('click', resetFilter);
        getEl('stncodeFilter').addEventListener('input', function(e) {
            clearTimeout(this._timeout);
            const self = this;
            this._timeout = setTimeout(() => {
                const val = self.value.trim();
                if (val.length === 8) {
                    applyFilter();
                }
            }, 300);
        });

        
        const calcPopupEl = getEl('calcPopup');
        const headerCalcTrigger = getEl('headerCalcTrigger');
        const calcPopupClose = getEl('calcPopupClose');
        const calcDaily = getEl('calcDaily');
        const calcStart = getEl('calcStart');
        const calcDays = getEl('calcDays');
        const calcUsed = getEl('calcUsed');
        const calcEnd = getEl('calcEnd');
        const calcTotal = getEl('calcTotal');
        const calcFeeFull = getEl('calcFeeFull');
        const calcFeeActual = getEl('calcFeeActual');

        function toggleCalcPopup() {
            if (calcPopupEl.style.display === 'none') {
                calcPopupEl.style.display = 'block';
                updateCalculation();
            } else {
                calcPopupEl.style.display = 'none';
            }
        }

        headerCalcTrigger.addEventListener('click', function(e) {
            toggleCalcPopup();
        });

        calcPopupClose.addEventListener('click', function(e) {
            toggleCalcPopup();
        });

        document.addEventListener('click', function(e) {
            if (calcPopupEl.style.display === 'block' && 
                !calcPopupEl.contains(e.target) && 
                e.target !== headerCalcTrigger && 
                !headerCalcTrigger.contains(e.target)) {
                calcPopupEl.style.display = 'none';
            }
        });

        function updateCalculation() {
            const daily = parseInt(calcDaily.value) || 0;
            const startVal = calcStart.value;
            const days = parseInt(calcDays.value) || 0;
            const used = parseInt(calcUsed.value) || 0;

            if (daily > 0 && startVal && days > 0) {
                const startDate = new Date(startVal + 'T00:00:00');
                startDate.setDate(startDate.getDate() + days - 1);
                const endStr = startDate.getFullYear() + '-' + String(startDate.getMonth() + 1).padStart(2, '0') + '-' + String(startDate.getDate()).padStart(2, '0');
                calcEnd.textContent = endStr;

                const total = daily * days;
                calcTotal.textContent = total;

                const feeFull = total * 0.5;
                calcFeeFull.textContent = feeFull.toFixed(2) + ' 元';

                const remainingHalfPrice = Math.max(0, 1000 - used);
                const currentBatchHalf = Math.min(remainingHalfPrice, total);
                const currentBatchDiscount = total - currentBatchHalf;
                
                const feeActual = currentBatchHalf * 0.5 + currentBatchDiscount * 0.2;
                calcFeeActual.textContent = feeActual.toFixed(2) + ' 元';
            } else {
                calcEnd.textContent = '-';
                calcTotal.textContent = '-';
                calcFeeFull.textContent = '-';
                calcFeeActual.textContent = '-';
            }
        }

        calcDaily.addEventListener('input', updateCalculation);
        calcStart.addEventListener('input', updateCalculation);
        calcDays.addEventListener('input', updateCalculation);
        calcUsed.addEventListener('input', updateCalculation);

        calcStart.value = getLocalDateString();
        updateCalculation();
    };

    const showLogin = () => {
        const loginSection = getEl('loginSection');
        const dataSection = getEl('dataSection');
        if (loginSection) loginSection.style.display = 'flex';
        if (dataSection) dataSection.style.display = 'none';
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
            const retryBtn = document.getElementById('retryLoadBtn');
            if (retryBtn) {
                retryBtn.replaceWith(retryBtn.cloneNode(true));
                document.getElementById('retryLoadBtn').addEventListener('click', () => {
                    getEl('dataError').innerHTML = '';
                    showData();
                });
            }
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
    };

    const updateUIByRole = async () => {
        const role = await getCurrentUserRole();
        const isSuperAdmin = (role === 'super_admin');
        getEl('adminBtn').style.display = isSuperAdmin ? 'inline-block' : 'none';
        getEl('configBtn').style.display = isSuperAdmin ? 'inline-block' : 'none';
    };

    
    const showAdminPanel = async () => {
        const role = await getCurrentUserRole();
        if (role !== 'super_admin') { showToast('权限不足'); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { showToast('请先登录'); return; }
        showLoading('正在获取用户列表...');
        let users = [];
        try {
            const { data, error } = await supabase.functions.invoke('list-users', { method: 'POST' });
            if (error) throw new Error(error.message);
            users = data.users || [];
        } catch (err) { hideLoading(); showToast('获取用户列表失败：' + err.message); return; }
        hideLoading();
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
        const adminUsers = users.filter(u => u.email !== SUPER_ADMIN_EMAIL && u.user_metadata?.role === 'admin');
        const userOptions = adminUsers.map(u => 
            `<option value="${escapeHtml(u.id)}">${escapeHtml(u.email)}</option>`
        ).join('');
        overlay.innerHTML = `
        <div class="modal" style="max-width: 900px;" role="dialog" aria-modal="true">
            <span class="close-btn" id="closeAdminPanel" aria-label="关闭">&times;</span>
            <h3>用户管理</h3>
            <div id="adminPanelMsg" class="error" style="margin-bottom: 10px;"></div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; border: 1px solid var(--glass-border); border-radius: 8px; padding: 12px 15px; width: 100%; box-sizing: border-box;">
                <div style="display: flex; flex-wrap: nowrap; gap: 8px; align-items: center; width: 100%; box-sizing: border-box;">
                    <label style="color: var(--accent); white-space: nowrap; flex-shrink: 0;">添加管理员</label>
                    <input type="email" id="newAdminEmail" placeholder="邮箱地址" style="flex: 1 1 0%; min-width: 0;">
                    <input type="password" id="newAdminPassword" placeholder="至少6位" style="flex: 1 1 0%; min-width: 0;" autocomplete="off">
                    <button class="btn-primary" id="doAddAdmin" style="white-space:nowrap; flex-shrink: 0;">创建</button>
                </div>
                <div style="display: flex; flex-wrap: nowrap; gap: 8px; align-items: center; width: 100%; box-sizing: border-box;">
                    <label style="color: var(--success); white-space: nowrap; flex-shrink: 0;">权限配置</label>
                    <select id="permUserSelect" style="flex: 1 1 0%; min-width: 0;">
                        <option value="">-- 选择管理员 --</option>
                        ${userOptions}
                    </select>
                    <button class="btn-success" id="doPermConfig" style="white-space:nowrap; flex-shrink: 0;">配置</button>
                </div>
            </div>
            <h4 style="color: var(--neon-blue); margin-bottom: 10px;">用户列表 (${users.length})</h4>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="user-table">
                    <thead><tr><th>邮箱</th><th>用户ID</th><th>角色</th><th style="text-align: center;">操作</th></tr></thead>
                    <tbody id="userTableBody">
                        ${users.map(u => {
                            let roleLabel = '普通用户';
                            if (u.email === SUPER_ADMIN_EMAIL) roleLabel = '超级管理员';
                            else if (u.user_metadata?.role === 'admin') roleLabel = '管理员';
                            const isSuperAdminUser = (u.email === SUPER_ADMIN_EMAIL);
                            return `<tr>
                                <td>${escapeHtml(u.email || '')}</td>
                                <td style="font-family: monospace;">${escapeHtml(u.id ? u.id.substring(0,8)+'...' : '')}</td>
                                <td>${escapeHtml(roleLabel)}</td>
                                <td style="text-align: center;">
                                    <button class="btn-primary reset-pwd-btn" data-userid="${escapeHtml(u.id)}" data-email="${escapeHtml(u.email)}">重置密码</button>
                                    <button class="btn-danger delete-user-btn" data-userid="${escapeHtml(u.id)}" data-email="${escapeHtml(u.email)}" ${isSuperAdminUser ? 'disabled title="不允许删除超级管理员"' : ''}>删除</button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.id === 'closeAdminPanel') {
                overlay.remove();
            }
        });

        document.getElementById('doPermConfig').addEventListener('click', async () => {
            const select = document.getElementById('permUserSelect');
            const userId = select.value;
            if (!userId) { showToast('请先选择一个管理员'); return; }
            const email = select.options[select.selectedIndex].text;
            await showPermissionConfig(userId, email, session.access_token);
        });

        
        document.getElementById('userTableBody').addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('reset-pwd-btn')) {
                const userId = target.dataset.userid; 
                const email = target.dataset.email;
                
                
                const newPassword = prompt(`为 ${email} 设置新密码（至少6位）：`);
                if (!newPassword || newPassword.length < 6) { 
                    showToast('密码不能为空且至少6位'); 
                    return; 
                }

                
                try {
                    let requestBody = { userId, newPassword };
                    if (email === SUPER_ADMIN_EMAIL) {
                        const secret = prompt('请输入超级管理员密钥（二次确认）：');
                        if (secret === null) return; // 用户取消
                        const trimmedSecret = secret.trim(); // 核心修复：去除前后空格
                        if (trimmedSecret === '') {
                            showToast('密钥不能为空');
                            return;
                        }
                        requestBody.secret = trimmedSecret; // 把去空格后的密钥传给后端
                    }
                    
                    
                    const { data, error } = await supabase.functions.invoke('reset-user-password', { 
                        method: 'POST', 
                        body: requestBody
                    });
                    
                    if (error) throw new Error(error.message);
                    if (data?.success) {
                        showToast('密码重置成功！', 'success'); 
                    } else {
                        throw new Error(data?.error || '未知错误');
                    }
                } catch (err) { 
                    showToast('重置失败：' + err.message); 
                }
            } else if (target.classList.contains('delete-user-btn')) {
                const userId = target.dataset.userid; const email = target.dataset.email;
                if (email === SUPER_ADMIN_EMAIL) { showToast('不允许删除超级管理员！'); return; }
                if (!confirm(`确定要删除用户 ${email} 吗？此操作不可撤销！`)) return;
                try {
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/delete-user`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error);
                    showToast('用户已删除', 'success'); overlay.remove(); showAdminPanel();
                } catch (err) { showToast('删除失败：' + err.message); }
            }
        });

        document.getElementById('doAddAdmin').addEventListener('click', async () => {
            const email = document.getElementById('newAdminEmail').value.trim();
            const password = document.getElementById('newAdminPassword').value;
            const msgEl = document.getElementById('adminPanelMsg');
            if (!email || !password || password.length < 6) { msgEl.textContent = '请输入有效邮箱和至少6位密码'; return; }
            try {
                const res = await fetch(`${SUPABASE_URL}/functions/v1/create-admin-user`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                showToast('管理员创建成功！', 'success'); overlay.remove(); showAdminPanel();
            } catch (err) { msgEl.textContent = '创建失败: ' + err.message; }
        });
    };

    // ------------------
    const showPermissionConfig = async (userId, email, accessToken) => {
        showLoading('加载站点数据...');
        let allStations = [];
        try {
            const { data, error } = await supabase.from('stations').select('stncode, shortname');
            if (error) throw error;
            allStations = data || [];
        } catch (err) {
            hideLoading(); showToast('加载站点失败: ' + err.message); return;
        }
        let currentCodes = [];
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/manage_permissions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get', userId })
            });
            const result = await res.json();
            if (res.ok) currentCodes = result.codes || [];
            else throw new Error(result.error || '获取权限失败');
        } catch (err) {
            hideLoading(); showToast('获取权限失败: ' + err.message); return;
        }
        hideLoading();

        const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
        overlay.innerHTML = `
        <div class="modal" style="max-width: 700px; max-height: 85vh; display: flex; flex-direction: column;" role="dialog" aria-modal="true">
            <span class="close-btn" id="closePermModal" aria-label="关闭">&times;</span>
            <h3>权限配置 - ${escapeHtml(email)}</h3>
            <div style="margin: 4px 0 8px 0; padding: 6px 10px; background: rgba(255,255,255,0.06); border-radius: 6px; border-left: 3px solid var(--neon-blue);">
                <span style="font-weight:600; color:var(--text-secondary);">管理员ID：</span>
                <span id="permAdminId" style="font-family: monospace; color:var(--text-primary); user-select: all;">${escapeHtml(userId)}</span>
                <span style="font-size:0.8rem; color:var(--text-secondary); margin-left:10px;">（点击选中可复制）</span>
            </div>
            <div id="selectedStationsDisplay" style="color:var(--success); font-weight:bold; margin: 6px 0; min-height: 24px; font-size: 0.95rem;">
                已选站点：${currentCodes.length > 0 ? currentCodes.join('、') : '（暂无）'}
            </div>
            <div style="margin: 10px 0; flex: 1; overflow-y: auto; border: 1px solid var(--glass-border); border-radius: 8px; padding: 8px; max-height: 55vh; min-height: 200px;">
                ${allStations.map(s => {
                    const checked = currentCodes.includes(s.stncode) ? 'checked' : '';
                    return `<div class="station-item"><input type="checkbox" value="${escapeHtml(s.stncode)}" id="perm_${escapeHtml(s.stncode)}" ${checked}><label for="perm_${escapeHtml(s.stncode)}">${escapeHtml(s.stncode)} - ${escapeHtml(s.shortname || '')}</label></div>`;
                }).join('')}
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
                <button id="savePermBtn" class="btn-primary">保存</button>
                <button id="cancelPermBtn" class="btn-danger">取消</button>
            </div>
            <p id="permMsg" class="error" style="margin-top: 6px;"></p>
        </div>`;
        document.body.appendChild(overlay);

        const updateSelectedDisplay = () => {
            const checkedBoxes = overlay.querySelectorAll('input[type="checkbox"]:checked');
            const codes = Array.from(checkedBoxes).map(cb => cb.value);
            const displayEl = overlay.querySelector('#selectedStationsDisplay');
            if (codes.length > 0) {
                displayEl.textContent = '已选站点：' + codes.join('、');
            } else {
                displayEl.textContent = '已选站点：（暂无）';
            }
        };

        overlay.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', updateSelectedDisplay);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.id === 'closePermModal' || e.target.id === 'cancelPermBtn') {
                overlay.remove();
            }
        });

        document.getElementById('savePermBtn').addEventListener('click', async () => {
            const checkedBoxes = overlay.querySelectorAll('input[type="checkbox"]:checked');
            const selectedCodes = Array.from(checkedBoxes).map(cb => cb.value);
            const msgEl = document.getElementById('permMsg');
            msgEl.textContent = '';
            try {
                const res = await fetch(`${SUPABASE_URL}/functions/v1/manage_permissions`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'set', userId, stncodeList: selectedCodes })
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || '保存失败');
                showToast('权限保存成功！', 'success');
                overlay.remove();
            } catch (err) {
                msgEl.textContent = '保存失败: ' + err.message;
            }
        });
    };

    // ---------- ----------
    const batchCreateAccounts = async () => {
        const role = await getCurrentUserRole();
        if (role !== 'super_admin') { showToast('权限不足'); return; }
        const btn = document.getElementById('batchCreateInConfigBtn');
        if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
        showLoading('正在清理无效用户绑定...');
        try {
            const { data: cleanResult, error: cleanError } = await supabase.rpc('clean_orphan_user_ids');
            if (cleanError) {
                showToast('清理孤儿用户ID失败: ' + cleanError.message);
                hideLoading();
                if (btn) { btn.disabled = false; btn.textContent = '批量生成账号'; }
                return;
            }
            hideLoading(); showLoading('正在批量生成账号...');
            const { data: { session } } = await supabase.auth.getSession(); if (!session) throw new Error('未登录');
            const res = await fetch(`${SUPABASE_URL}/functions/v1/batch-create-accounts`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' } });
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const json = await res.json();
                if (res.ok) showToast(json.message || '批量生成完成', 'success');
                else showToast('错误：' + (json.error || json.message || '未知错误'));
            } else if (!res.ok) { const text = await res.text(); showToast('生成失败：' + text); }
            else {
                const blob = await res.blob(); const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'accounts.csv';
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                showToast('批量生成完成，CSV 文件已下载。', 'success');
            }
        } catch (err) { showToast('操作失败：' + err.message); } finally { hideLoading(); if (btn) { btn.disabled = false; btn.textContent = '批量生成账号'; } }
    };

    const parseFuelMappings = (text) => {
        const mappings = [];
        if (!text) return mappings;
        const parts = text.split(',');
        for (let i = 0; i < parts.length; i += 2) {
            const gcodePart = parts[i]?.trim();
            const gnamePart = parts[i + 1]?.trim();
            if (gcodePart && gnamePart) {
                const gcode = gcodePart.replace('gcode:', '').trim();
                const gname = gnamePart.replace('gname:', '').trim();
                if (gcode && gname) mappings.push({ gcode, gname });
            }
        }
        return mappings;
    };

    const serializeFuelMappings = (mappings) => mappings.map(m => `gcode:${m.gcode},gname:${m.gname}`).join(',');

    class FuelMappingEditor {
        constructor(container, initialValue = '', enabled = true) {
            this.container = container;
            this.enabled = enabled;
            this._build(initialValue);
        }
        _build(initialValue) {
            this.container.innerHTML = '';
            const presetDiv = document.createElement('div');
            presetDiv.style.display = 'flex';
            presetDiv.style.gap = '4px';
            presetDiv.style.flexWrap = 'nowrap';
            presetDiv.style.overflowX = 'auto';
            presetDiv.style.marginBottom = '6px';
            const PRESET_FUELS = [
                { gcode: "60518727", gname: "95号车用汽油(ⅥB)", label: "95汽油" },
                { gcode: "60518726", gname: "92号车用汽油(ⅥB)", label: "92汽油" },
                { gcode: "60518728", gname: "98号车用汽油(ⅥA)(ⅥB)", label: "98汽油" },
                { gcode: "60523537", gname: "爱跑98号车用汽油(ⅥB)", label: "爱跑98" },
                { gcode: "60514943", gname: "0号车用柴油(VI)", label: "0#柴油" },
            ];
            PRESET_FUELS.forEach(f => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'fuel-preset-btn preset-fuel-btn';
                btn.textContent = f.label;
                btn.addEventListener('click', () => {
                    if (!this.enabled) return;
                    this._togglePreset(btn, f.gcode, f.gname);
                });
                presetDiv.appendChild(btn);
                btn._fuelData = { gcode: f.gcode, gname: f.gname };
            });
            const entriesDiv = document.createElement('div');
            entriesDiv.className = 'fuel-entries';
            this.entriesDiv = entriesDiv;
            this.container.appendChild(presetDiv);
            this.container.appendChild(entriesDiv);
            const mappings = parseFuelMappings(initialValue);
            if (mappings.length === 0) mappings.push({ gcode: '', gname: '' });
            mappings.forEach(m => this._addEntry(m.gcode, m.gname));
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'mode-btn';
            addBtn.textContent = '+ 自定义油品';
            addBtn.style.marginTop = '8px';
            addBtn.addEventListener('click', () => { if (this.enabled) this._addEntry('', ''); });
            this.addBtn = addBtn;
            entriesDiv.appendChild(addBtn);
            this._syncPresetButtons();
            this._applyEnabledState();
        }
        _addEntry(gcode, gname) {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'fuel-mapping-entry';
            entryDiv.innerHTML = `<input type="text" placeholder="gcode" value="${escapeHtml(gcode)}" class="fuel-gcode"><input type="text" placeholder="gname" value="${escapeHtml(gname)}" class="fuel-gname"><button type="button" class="btn-remove-fuel">✕</button>`;
            entryDiv.querySelector('.btn-remove-fuel').addEventListener('click', () => {
                entryDiv.remove();
                this._syncPresetButtons();
            });
            this.entriesDiv.insertBefore(entryDiv, this.addBtn);
            this._syncPresetButtons();
        }
        _togglePreset(btn, gcode, gname) {
            const existing = Array.from(this.entriesDiv.querySelectorAll('.fuel-gcode')).find(inp => inp.value.trim() === gcode);
            if (existing) {
                existing.closest('.fuel-mapping-entry').remove();
            } else {
                this._addEntry(gcode, gname);
            }
            this._syncPresetButtons();
        }
        _syncPresetButtons() {
            const existingGcodes = new Set();
            this.entriesDiv.querySelectorAll('.fuel-gcode').forEach(inp => {
                if (inp.value.trim()) existingGcodes.add(inp.value.trim());
            });
            this.container.querySelectorAll('.preset-fuel-btn').forEach(btn => {
                if (existingGcodes.has(btn._fuelData.gcode)) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }
        _applyEnabledState() {
            const inputs = this.entriesDiv.querySelectorAll('input');
            const removeBtns = this.entriesDiv.querySelectorAll('.btn-remove-fuel');
            const presetBtns = this.container.querySelectorAll('.preset-fuel-btn');
            inputs.forEach(inp => { inp.readOnly = !this.enabled; });
            removeBtns.forEach(btn => { btn.disabled = !this.enabled; btn.style.opacity = this.enabled ? '1' : '0.5'; });
            presetBtns.forEach(btn => { btn.style.pointerEvents = this.enabled ? 'auto' : 'none'; btn.style.opacity = this.enabled ? '1' : '0.5'; });
            this.addBtn.style.display = this.enabled ? 'inline-flex' : 'none';
        }
        setEnabled(enabled) { this.enabled = enabled; this._applyEnabledState(); }
        getMappings() {
            const mappings = [];
            this.entriesDiv.querySelectorAll('.fuel-mapping-entry').forEach(entry => {
                const gcode = entry.querySelector('.fuel-gcode').value.trim();
                const gname = entry.querySelector('.fuel-gname').value.trim();
                if (gcode && gname) mappings.push({ gcode, gname });
            });
            return mappings;
        }
    }

    class CardnoEditor {
        constructor(container, initialValue = '', enabled = true) {
            this.container = container;
            this.enabled = enabled;
            this._build(initialValue);
        }
        _build(initialValue) {
            this.container.innerHTML = '';
            const entriesDiv = document.createElement('div');
            entriesDiv.className = 'cardno-entries';
            this.entriesDiv = entriesDiv;
            this.container.appendChild(entriesDiv);
            const cards = initialValue ? initialValue.split(',').map(s => s.trim()).filter(Boolean) : [];
            if (cards.length === 0) for (let i = 0; i < 4; i++) cards.push('');
            cards.forEach(card => this._addEntry(card));
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'mode-btn';
            addBtn.textContent = '+ 添加卡号';
            addBtn.style.marginTop = '8px';
            addBtn.addEventListener('click', () => { if (this.enabled) this._addEntry(''); });
            this.addBtn = addBtn;
            entriesDiv.appendChild(addBtn);
            this._applyEnabledState();
        }
        _addEntry(value) {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'cardno-entry';
            entryDiv.innerHTML = `<input type="text" placeholder="卡号" value="${escapeHtml(value)}" class="cardno-input"><button type="button" class="btn-remove-cardno">✕</button>`;
            entryDiv.querySelector('.btn-remove-cardno').addEventListener('click', () => entryDiv.remove());
            this.entriesDiv.insertBefore(entryDiv, this.addBtn);
        }
        _applyEnabledState() {
            const inputs = this.entriesDiv.querySelectorAll('input');
            const removeBtns = this.entriesDiv.querySelectorAll('.btn-remove-cardno');
            inputs.forEach(inp => { inp.readOnly = !this.enabled; });
            removeBtns.forEach(btn => { btn.disabled = !this.enabled; btn.style.opacity = this.enabled ? '1' : '0.5'; });
            this.addBtn.style.display = this.enabled ? 'inline-flex' : 'none';
        }
        setEnabled(enabled) { this.enabled = enabled; this._applyEnabledState(); }
        getCards() {
            return Array.from(this.entriesDiv.querySelectorAll('.cardno-input'))
                .map(inp => inp.value.trim())
                .filter(Boolean);
        }
    }

    let stationsList = [], currentEditStationId = null;
    let fuelLocked = true, cardnoLocked = true;
    let stationFormDirty = false;

    const markStationFormDirty = () => { stationFormDirty = true; };

    const showStationConfig = async () => {
        const role = await getCurrentUserRole();
        if (role !== 'super_admin') { showToast('权限不足'); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { showToast('请先登录'); return; }
        showLoading('正在加载站点列表...');
        try {
            const { data, error } = await supabase.from('stations').select('id, stncode, shortname, startdate, enddate');
            if (error) throw error;
            stationsList = data || [];
        } catch (err) { hideLoading(); showToast('加载站点列表失败: ' + err.message); return; }
        hideLoading();
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
        overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin:0;">站点数据配置</h3>
                <div><button id="batchCreateInConfigBtn" class="btn-primary" style="margin-right:10px;">批量生成账号</button><span class="close-btn" id="closeConfigModal" aria-label="关闭">&times;</span></div>
            </div>
            <div class="mode-switch"><div id="tabEdit" class="mode-btn active">编辑站点</div><div id="tabCreate" class="mode-btn">新增站点</div><div id="tabBatch" class="mode-btn">批量启用/禁用</div></div>
            <div id="panelEdit" class="panel active">
                <div class="field-row"><label for="stationSelect">选择站点：</label><select id="stationSelect"><option value="">-- 请选择站点 --</option>${stationsList.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.stncode)} - ${escapeHtml(s.shortname)}</option>`).join('')}</select></div>
                <div class="field-row"><label>交易组织代码</label><input type="text" id="transactionorgcode"></div>
                <div class="field-group"><div class="field-row"><label>已用次数</label><input type="number" id="usedcount"></div><div class="field-row"><label>每日次数</label><input type="number" id="count"></div></div>
                <div class="field-group"><div class="field-row"><label>开始日期</label><input type="date" id="startdate"></div><div class="field-row"><label>结束日期</label><input type="date" id="enddate"></div></div>
                <div class="field-row"><label>最后重置日期</label><input type="date" id="lastresetdate"></div>
                <div class="field-row"><label>关联用户ID</label><input type="text" id="user_id" placeholder="UUID"></div>
                <div class="fuel-section"><label>油品映射 <span class="lock-icon" id="lockFuelEdit" title="锁定/解锁编辑">🔒</span></label><div class="fuel-editor-container" id="editFuelMappingEditor"></div></div>
                <div class="cardno-section"><label>卡号数组 <span class="lock-icon" id="lockCardnoEdit" title="锁定/解锁编辑">🔒</span></label><div class="cardno-editor-container" id="editCardnoEditor"></div></div>
                <div class="edit-create-footer"><button id="deleteStationBtn" class="btn-danger" style="display:none;">🗑️ 删除站点</button><button id="saveEditBtn" class="btn-primary">保存配置</button><button id="cancelConfigBtn" class="btn-danger">取消</button></div>
            </div>
            <div id="panelCreate" class="panel">
                <div class="field-row"><label for="newStncode">站点编码</label><input type="text" id="newStncode" placeholder="例如 33300011"></div>
                <div class="field-row"><label for="newShortname">站点简称</label><input type="text" id="newShortname" placeholder="中国石化新站点"></div>
                <div class="field-row"><label>交易组织代码</label><input type="text" id="newTransactionorgcode"></div>
                <div class="field-group"><div class="field-row"><label>已用次数</label><input type="number" id="newUsedcount"></div><div class="field-row"><label>每日次数</label><input type="number" id="newCount"></div></div>
                <div class="field-group"><div class="field-row"><label>开始日期</label><input type="date" id="newStartdate"></div><div class="field-row"><label>结束日期</label><input type="date" id="newEnddate"></div></div>
                <div class="fuel-section"><label>油品映射</label><div class="fuel-editor-container" id="fuelMappingEditor"></div></div>
                <div class="cardno-section"><label>卡号数组</label><div class="cardno-editor-container" id="newCardnoEditor"></div></div>
                <div class="edit-create-footer"><button id="saveCreateBtn" class="btn-primary">保存配置</button><button id="cancelConfigBtn2" class="btn-danger">取消</button></div>
            </div>
            <div id="panelBatch" class="panel">
                <div class="batch-section">
                    <div class="batch-controls"><button id="enableAllBtn" class="btn-success">✅ 全部启用</button><button id="disableAllBtn" class="btn-danger">⛔ 全部禁用</button><button id="enableSelectedBtn" class="btn-primary">✔️ 启用选中</button><button id="disableSelectedBtn" class="btn-primary">❌ 禁用选中</button></div>
                    <div class="date-range-panel"><div class="date-input"><label for="customStartDate">开始日期</label><input type="date" id="customStartDate"></div><div class="date-input"><label for="customEndDate">结束日期</label><input type="date" id="customEndDate"></div></div>
                    <div class="station-list" id="stationChecklist">${stationsList.map(s => { const today = getLocalDateString(); const start = s.startdate ? s.startdate.slice(0,10) : ''; const end = s.enddate ? s.enddate.slice(0,10) : ''; const isEnabled = (start <= today && today <= end); return `<div class="station-item"><input type="checkbox" value="${escapeHtml(s.id)}" id="chk_${escapeHtml(s.id)}"><label for="chk_${escapeHtml(s.id)}">${escapeHtml(s.stncode)} - ${escapeHtml(s.shortname)} (区间: ${escapeHtml(start||'无')} ~ ${escapeHtml(end||'无')}) ${isEnabled ? '✅启用中' : '❌已禁用'}</label></div>`; }).join('')}</div>
                    <div class="batch-action-buttons"><button id="applyDateToSelected" class="btn-primary">📅 应用到选中</button><button id="applyDateToAll" class="btn-primary">📅 应用到全部</button><button id="cancelBatchBtn" class="btn-danger">取消</button></div>
                </div>
            </div>
            <p id="configMsg" class="error"></p></div>`;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target.id === 'closeConfigModal' || e.target.id === 'cancelConfigBtn' || e.target.id === 'cancelConfigBtn2' || e.target.id === 'cancelBatchBtn') {
                if (stationFormDirty && !confirm('您有未保存的修改，确定要关闭吗？')) return;
                overlay.remove();
            }
        });

        document.getElementById('batchCreateInConfigBtn').addEventListener('click', batchCreateAccounts);

        const tabEdit = document.getElementById('tabEdit'), tabCreate = document.getElementById('tabCreate'), tabBatch = document.getElementById('tabBatch');
        const panelEdit = document.getElementById('panelEdit'), panelCreate = document.getElementById('panelCreate'), panelBatch = document.getElementById('panelBatch');
        function setActiveTab(active) {
            if (active !== 'edit' && stationFormDirty && !confirm('您有未保存的修改，确定要切换吗？')) return;
            [tabEdit,tabCreate,tabBatch].forEach(t => t.classList.remove('active'));
            [panelEdit,panelCreate,panelBatch].forEach(p => p.classList.remove('active'));
            if (active === 'edit') { tabEdit.classList.add('active'); panelEdit.classList.add('active'); }
            else if (active === 'create') { tabCreate.classList.add('active'); panelCreate.classList.add('active'); }
            else { tabBatch.classList.add('active'); panelBatch.classList.add('active'); }
            stationFormDirty = false;
        }
        tabEdit.onclick = () => setActiveTab('edit');
        tabCreate.onclick = () => setActiveTab('create');
        tabBatch.onclick = () => setActiveTab('batch');
        const fuelEditor = new FuelMappingEditor(document.getElementById('fuelMappingEditor'), "gcode:60518727,gname:95号车用汽油(ⅥB),gcode:60518726,gname:92号车用汽油(ⅥB),gcode:60514943,gname:0号车用柴油(VI)", true);
        const newCardnoEditor = new CardnoEditor(document.getElementById('newCardnoEditor'), "1000419000000071231,1000419000000064385,1000419000000066590,1000419000000069220", true);
        let editFuelEditor = null, editCardnoEditor = null;
        document.getElementById('lockFuelEdit').addEventListener('click', () => {
            fuelLocked = !fuelLocked; document.getElementById('lockFuelEdit').textContent = fuelLocked ? '🔒' : '🔓';
            if (editFuelEditor) editFuelEditor.setEnabled(!fuelLocked);
            markStationFormDirty();
        });
        document.getElementById('lockCardnoEdit').addEventListener('click', () => {
            cardnoLocked = !cardnoLocked; document.getElementById('lockCardnoEdit').textContent = cardnoLocked ? '🔒' : '🔓';
            if (editCardnoEditor) editCardnoEditor.setEnabled(!cardnoLocked);
            markStationFormDirty();
        });
        async function loadStationForEdit(stationId) {
            if (!stationId) { document.getElementById('deleteStationBtn').style.display = 'none'; stationFormDirty = false; return; }
            try {
                const { data, error } = await supabase.from('stations').select('*').eq('id', stationId).single();
                if (error) throw error;
                if (data) {
                    document.getElementById('transactionorgcode').value = data.transactionorgcode || '';
                    document.getElementById('usedcount').value = data.usedcount ?? '';
                    document.getElementById('count').value = data.count ?? '';
                    document.getElementById('startdate').value = data.startdate ? data.startdate.slice(0,10) : '';
                    document.getElementById('enddate').value = data.enddate ? data.enddate.slice(0,10) : '';
                    document.getElementById('lastresetdate').value = data.lastresetdate ? data.lastresetdate.slice(0,10) : '';
                    document.getElementById('user_id').value = data.user_id || '';
                    editFuelEditor = new FuelMappingEditor(document.getElementById('editFuelMappingEditor'), data.fuelmappings || '', !fuelLocked);
                    editCardnoEditor = new CardnoEditor(document.getElementById('editCardnoEditor'), data.cardnoarray || '', !cardnoLocked);
                    document.getElementById('deleteStationBtn').style.display = 'inline-block';
                    stationFormDirty = false;
                }
            } catch (err) { document.getElementById('configMsg').textContent = '加载站点数据失败: ' + err.message; }
        }
        document.getElementById('stationSelect').addEventListener('change', (e) => {
            if (stationFormDirty && !confirm('您有未保存的修改，是否放弃并切换站点？')) {
                e.target.value = currentEditStationId || '';
                return;
            }
            currentEditStationId = e.target.value;
            if (currentEditStationId) loadStationForEdit(currentEditStationId);
            else {
                document.getElementById('deleteStationBtn').style.display = 'none';
                ['transactionorgcode','usedcount','count','startdate','enddate','lastresetdate','user_id'].forEach(id => document.getElementById(id).value = '');
                document.getElementById('editFuelMappingEditor').innerHTML = ''; document.getElementById('editCardnoEditor').innerHTML = '';
                stationFormDirty = false;
            }
        });
        ['transactionorgcode','usedcount','count','startdate','enddate','lastresetdate','user_id'].forEach(id => {
            document.getElementById(id).addEventListener('input', markStationFormDirty);
            document.getElementById(id).addEventListener('change', markStationFormDirty);
        });
        document.getElementById('saveEditBtn').addEventListener('click', async () => {
            const msg = document.getElementById('configMsg'); msg.textContent = '';
            const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
            if (!currentEditStationId) { msg.textContent = '请选择站点'; return; }
            const config = {
                transactionorgcode: document.getElementById('transactionorgcode').value,
                usedcount: parseInt(document.getElementById('usedcount').value) || null,
                count: parseInt(document.getElementById('count').value) || null,
                startdate: document.getElementById('startdate').value || null,
                enddate: document.getElementById('enddate').value || null,
                lastresetdate: document.getElementById('lastresetdate').value || null,
                user_id: document.getElementById('user_id').value,
                fuelmappings: serializeFuelMappings(editFuelEditor.getMappings()),
                cardnoarray: editCardnoEditor.getCards().join(',')
            };
            try {
                const res = await fetch(`${SUPABASE_URL}/functions/v1/update-station-config`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ stationId: currentEditStationId, config }) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                showToast('更新成功', 'success');
                stationFormDirty = false;
                updateTodayTasks().catch(e => console.error(e));
                overlay.remove();
            } catch (err) { msg.textContent = '保存失败: ' + err.message; }
        });
        document.getElementById('saveCreateBtn').addEventListener('click', async () => {
            const msg = document.getElementById('configMsg'); msg.textContent = '';
            const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
            const stncode = document.getElementById('newStncode').value.trim();
            const shortname = document.getElementById('newShortname').value.trim();
            if (!stncode || !shortname) { msg.textContent = '站点编码和简称为必填'; return; }
            const newStation = {
                stncode, shortname,
                transactionorgcode: document.getElementById('newTransactionorgcode').value,
                usedcount: parseInt(document.getElementById('newUsedcount').value) || null,
                count: parseInt(document.getElementById('newCount').value) || null,
                startdate: document.getElementById('newStartdate').value || null,
                enddate: document.getElementById('newEnddate').value || null,
                fuelmappings: serializeFuelMappings(fuelEditor.getMappings()),
                cardnoarray: newCardnoEditor.getCards().join(',')
            };
            try {
                const res = await fetch(`${SUPABASE_URL}/functions/v1/create-station`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(newStation) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                showToast('新增成功', 'success');
                updateTodayTasks().catch(e => console.error(e));
                overlay.remove();
            } catch (err) { msg.textContent = '新增失败: ' + err.message; }
        });
        document.getElementById('deleteStationBtn').addEventListener('click', async () => {
            if (!currentEditStationId) return;
            if (!confirm('确定删除该站点？此操作不可撤销！')) return;
            try {
                const { error } = await supabase.from('stations').delete().eq('id', currentEditStationId);
                if (error) throw error;
                showToast('站点已删除', 'success');
                updateTodayTasks().catch(e => console.error(e));
                overlay.remove();
            } catch (err) { document.getElementById('configMsg').textContent = '删除失败: ' + err.message; }
        });
        async function updateStationsDates(stationIds, startdate, enddate) {
            if (!stationIds.length) { showToast('没有选中任何站点'); return; }
            if (startdate && enddate && startdate > enddate) {
                showToast('开始日期不能晚于结束日期');
                return;
            }
            const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
            try {
                const res = await fetch(`${SUPABASE_URL}/functions/v1/update-stations-dates`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ stationIds, startdate, enddate }) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                showToast(`成功更新 ${result.updatedCount} 个站点`, 'success');
                await refreshStationList();
                updateTodayTasks().catch(e => console.error(e));
            } catch (err) { showToast('批量更新失败: ' + err.message); }
        }
        function getSelectedIds() { return Array.from(document.querySelectorAll('#stationChecklist input[type="checkbox"]:checked')).map(cb => cb.value); }
        async function refreshStationList() {
            const { data, error } = await supabase.from('stations').select('id, stncode, shortname, startdate, enddate');
            if (!error && data) {
                stationsList = data; const container = document.getElementById('stationChecklist');
                const today = getLocalDateString();
                container.innerHTML = stationsList.map(s => {
                    const start = s.startdate ? s.startdate.slice(0,10) : ''; const end = s.enddate ? s.enddate.slice(0,10) : '';
                    const isEnabled = (start <= today && today <= end);
                    return `<div class="station-item"><input type="checkbox" value="${escapeHtml(s.id)}" id="chk_${escapeHtml(s.id)}"><label for="chk_${escapeHtml(s.id)}">${escapeHtml(s.stncode)} - ${escapeHtml(s.shortname)} (区间: ${escapeHtml(start||'无')} ~ ${escapeHtml(end||'无')}) ${isEnabled ? '✅启用中' : '❌已禁用'}</label></div>`;
                }).join('');
            }
        }
        const todayStr = getLocalDateString(), farFuture = '2099-12-31';
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1); const yesterdayStr = getLocalDateString(yesterday);
        document.getElementById('enableAllBtn').addEventListener('click', () => { if (!confirm('⚠️ 确定要启用全部站点吗？')) return; updateStationsDates(stationsList.map(s => s.id), todayStr, farFuture); });
        document.getElementById('disableAllBtn').addEventListener('click', () => { if (!confirm('⚠️ 确定要禁用全部站点吗？这可能导致服务不可用！')) return; updateStationsDates(stationsList.map(s => s.id), null, yesterdayStr); });
        document.getElementById('enableSelectedBtn').addEventListener('click', () => { const ids = getSelectedIds(); if (!ids.length) showToast('请先勾选'); else { if (!confirm('⚠️ 确定要启用选中的站点吗？')) return; updateStationsDates(ids, todayStr, farFuture); } });
        document.getElementById('disableSelectedBtn').addEventListener('click', () => { const ids = getSelectedIds(); if (!ids.length) showToast('请先勾选'); else { if (!confirm('⚠️ 确定要禁用选中的站点吗？')) return; updateStationsDates(ids, null, yesterdayStr); } });
        document.getElementById('applyDateToSelected').addEventListener('click', () => { const start = document.getElementById('customStartDate').value, end = document.getElementById('customEndDate').value; if (!start || !end) showToast('请填写完整日期'); else { const ids = getSelectedIds(); if (!ids.length) showToast('请先勾选站点'); else updateStationsDates(ids, start, end); } });
        document.getElementById('applyDateToAll').addEventListener('click', () => { const start = document.getElementById('customStartDate').value, end = document.getElementById('customEndDate').value; if (!start || !end) showToast('请填写完整日期'); else updateStationsDates(stationsList.map(s => s.id), start, end); });
    };

    // ----------------------------------------
    const bindEvents = () => {
        const loginBtn = getEl('loginBtn');
        if (loginBtn) loginBtn.addEventListener('click', login);
        
        const logoutBtn = getEl('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        
        const togglePwd = getEl('togglePwd');
        if (togglePwd) {
            togglePwd.addEventListener('click', () => {
                const pwd = getEl('password'), btn = getEl('togglePwd');
                if (pwd && btn) {
                    if (pwd.type === 'password') { pwd.type = 'text'; btn.innerHTML = '🙈'; }
                    else { pwd.type = 'password'; btn.innerHTML = '👁️'; }
                }
            });
        }
        
        const adminBtn = getEl('adminBtn');
        if (adminBtn) adminBtn.addEventListener('click', showAdminPanel);
        
        const configBtn = getEl('configBtn');
        if (configBtn) configBtn.addEventListener('click', showStationConfig);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && getEl('loginSection').style.display !== 'none') {
                const loginBtn2 = getEl('loginBtn');
                if (loginBtn2 && !loginBtn2.disabled) login();
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
