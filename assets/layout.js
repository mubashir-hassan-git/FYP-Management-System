const NAV_CONFIG = {
    student: [
        { id: 'dashboard',   label: 'Dashboard',      icon: 'dashboard',    href: 'dashboard.html' },
        { id: 'project',     label: 'My Project',      icon: 'folder_open',  href: 'project.html' },
        { id: 'group',       label: 'Group Members',   icon: 'group',        href: 'group.html' },
        { id: 'milestones',  label: 'Milestones',      icon: 'flag',         href: 'milestones.html' },
        { id: 'submissions', label: 'Submissions',     icon: 'upload_file',  href: 'submissions.html' },
        { id: 'feedback',    label: 'Feedback',        icon: 'forum',        href: 'feedback.html' },
        { id: 'evaluations', label: 'Evaluations',     icon: 'fact_check',   href: 'evaluations.html' },
        { id: 'profile',     label: 'My Profile',      icon: 'person',       href: 'profile.html' }
    ],
    faculty: [
        { id: 'dashboard',   label: 'Dashboard',               icon: 'dashboard',    href: 'dashboard.html' },
        { id: 'projects',    label: 'Projects & Groups',        icon: 'folder_open',  href: 'projects.html' },
        { id: 'submissions', label: 'Submissions & Feedback',   icon: 'upload_file',  href: 'submissions.html' },
        { id: 'milestones',  label: 'Milestones',               icon: 'flag',         href: 'milestones.html' },
        { id: 'evaluations', label: 'Evaluations',              icon: 'fact_check',   href: 'evaluations.html' },
        { id: 'profile',     label: 'Faculty Profile',          icon: 'person',       href: 'profile.html' }
    ],
    evaluator: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
        { id: 'evaluations', label: 'Assigned Evaluations', icon: 'assignment', href: 'evaluations.html' },
        { id: 'rubrics', label: 'Rubrics', icon: 'description', href: 'rubrics.html' },
        { id: 'marking', label: 'Marking Sheet', icon: 'fact_check', href: 'marking.html' },
        { id: 'results', label: 'Results', icon: 'analytics', href: 'results.html' },
        { id: 'profile', label: 'Evaluator Profile', icon: 'person', href: 'profile.html' }
    ],
    coordinator: [
        { id: 'dashboard',   label: 'Dashboard',      icon: 'dashboard',           href: 'dashboard.html' },
        { id: 'students',    label: 'Students',        icon: 'school',              href: 'students.html' },
        { id: 'faculty',     label: 'Faculty',         icon: 'person_book',         href: 'faculty.html' },
        { id: 'groups',      label: 'Groups',          icon: 'groups',              href: 'groups.html' },
        { id: 'projects',    label: 'Projects',        icon: 'folder_open',         href: 'projects.html' },
        { id: 'supervision', label: 'Supervision',     icon: 'supervisor_account',  href: 'supervision.html' },
        { id: 'milestones',  label: 'Milestones',      icon: 'flag',                href: 'milestones.html' },
        { id: 'submissions', label: 'Submissions',     icon: 'upload_file',         href: 'submissions.html' },
        { id: 'evaluations', label: 'Evaluations',     icon: 'fact_check',          href: 'evaluations.html' },
        { id: 'evaluators',  label: 'Evaluators',      icon: 'badge',               href: 'evaluators.html' },
        { id: 'profile',     label: 'Profile',         icon: 'person',              href: 'profile.html' }
    ],
    superadmin: [
        { id: 'dashboard', label: 'Dashboard',      icon: 'admin_panel_settings', href: 'dashboard.html' },
        { id: 'accounts',  label: 'User Accounts',  icon: 'manage_accounts',      href: 'accounts.html' },
        { id: 'access',    label: 'Access Control', icon: 'lock',                 href: 'access.html' },
        { id: 'profile',   label: 'Admin Profile',  icon: 'person',               href: 'profile.html' }
    ]
};

function renderSidebar(role, activePage, session) {
    const nav = NAV_CONFIG[role] || [];
    const navHtml = nav.map(item => {
        const isActive = item.id === activePage;
        const cls = isActive
            ? 'bg-secondary-container text-on-secondary-container border-l-4 border-on-secondary-fixed font-bold flex items-center gap-3 px-4 py-3 rounded-r-lg scale-[0.98] transition-transform'
            : 'text-on-primary/80 hover:text-on-primary hover:bg-on-primary/10 transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg';
        return `<a class="${cls}" href="${item.href}">
            <span class="material-symbols-outlined">${item.icon}</span>
            <span class="font-label-md text-label-md">${item.label}</span>
        </a>`;
    }).join('');

    return `<aside class="fixed h-full w-sidebar-width left-0 top-0 bg-primary shadow-xl flex flex-col py-unit-lg px-unit-md z-50">
        <div class="mb-unit-xl px-2">
            <h1 class="font-headline-md text-headline-md font-bold text-on-primary">Namal FYP</h1>
            <p class="font-label-md text-label-md text-on-primary/60">Excellence Portal</p>
        </div>
        <nav class="flex-1 space-y-1 overflow-y-auto">${navHtml}</nav>
        <div class="mt-auto border-t border-on-primary/10 pt-unit-md">
            <button onclick="logout()" class="w-full text-on-primary/80 hover:text-on-primary hover:bg-on-primary/10 transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg text-left">
                <span class="material-symbols-outlined">logout</span>
                <span class="font-label-md text-label-md">Sign Out</span>
            </button>
        </div>
    </aside>`;
}

function renderTopNav(session, searchPlaceholder = 'Search...') {
    return `<header class="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-margin-desktop z-40 shadow-sm">
        <div class="flex items-center gap-4 flex-1">
            <div class="relative w-full max-w-md">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input class="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-body-sm" placeholder="${searchPlaceholder}" type="text"/>
            </div>
        </div>
        <div class="flex items-center gap-unit-md">
            <button class="relative p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
                <span class="material-symbols-outlined">notifications</span>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div class="h-8 w-px bg-outline-variant"></div>
            <div class="flex items-center gap-3">
                <div class="text-right hidden sm:block">
                    <p class="font-label-md text-label-md text-on-surface font-bold">${session.name}</p>
                    <p class="font-label-sm text-label-sm text-on-surface-variant">${session.subtitle}</p>
                </div>
                <img alt="User Profile" class="w-10 h-10 rounded-full border-2 border-primary-container object-cover" src="${session.avatar}"/>
            </div>
        </div>
    </header>`;
}

function initPage(role, activePage, options = {}) {
    const session = requireAuth([role]);
    if (!session) return;

    const sidebarEl = document.getElementById('app-sidebar');
    const topnavEl = document.getElementById('app-topnav');
    if (sidebarEl) sidebarEl.innerHTML = renderSidebar(role, activePage, session);
    if (topnavEl) topnavEl.innerHTML = renderTopNav(session, options.searchPlaceholder || 'Search...');

    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-4px)'; });
        card.addEventListener('mouseleave', () => { card.style.transform = 'translateY(0)'; });
    });

    // Run dynamic DB population sync engine
    populateDatabaseData(role, activePage);
}

// ==================== DATABASE SYNC ENGINE ====================

async function populateDatabaseData(role, activePage) {
    const token = localStorage.getItem('namal_fyp_token');
    if (!token) return;

    const getBasePath = () => {
        const path = window.location.pathname;
        if (path.includes('/student/') || path.includes('/faculty/') ||
            path.includes('/evaluator/') || path.includes('/coordinator/')) {
            return '../';
        }
        return '';
    };

    const fetchAPI = async (endpoint, options = {}) => {
        const base = getBasePath();
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };
        if (!(options.body instanceof FormData) && typeof options.body === 'object') {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }
        const response = await fetch(base + 'api' + endpoint, { ...options, headers });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `API error: ${response.status}`);
        }
        return response.json();
    };

    try {
        if (role === 'student') {
            if (activePage === 'dashboard') {
                const data = await fetchAPI('/students/dashboard');

                // Welcome message
                const welcomeEl = document.querySelector('main header h1');
                if (welcomeEl) welcomeEl.textContent = `Welcome Back, ${data.student.name}!`;

                // Stats Cards
                const stats = document.querySelectorAll('.grid > div p.font-headline-sm');
                if (stats.length >= 4) {
                    stats[0].textContent = String(data.stats.totalMilestones).padStart(2, '0');
                    stats[1].textContent = String(data.stats.completedMilestones).padStart(2, '0');
                    stats[2].textContent = String(data.stats.pendingMilestones).padStart(2, '0');
                    stats[3].textContent = data.stats.projectStatus;
                }

                // Project Details Card
                const projCard = document.querySelector('.lg\\:col-span-8 > div:first-child');
                if (projCard) {
                    projCard.querySelector('h3').textContent = data.student.projectTitle;
                    const details = projCard.querySelectorAll('.grid > div p:last-child');
                    if (details.length >= 3) {
                        details[0].textContent = data.student.projectDomain;
                        details[1].textContent = data.student.supervisorName;
                        details[2].textContent = data.student.groupName;
                    }
                }

                // Recent Submissions table
                const subTableBody = document.querySelector('table tbody');
                if (subTableBody && data.submissions) {
                    subTableBody.innerHTML = data.submissions.map(sub => {
                        const statusColor = sub.status === 'Reviewed' 
                            ? 'bg-success-emerald/10 text-success-emerald' 
                            : 'bg-secondary-container/10 text-secondary-container';
                        const actionBtn = sub.fileId 
                            ? `<a href="../api/submissions/download/${sub.fileId}" class="text-primary hover:underline font-bold"><span class="material-symbols-outlined">download</span></a>`
                            : `<span class="material-symbols-outlined text-text-muted">hourglass_empty</span>`;
                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-6 py-4 font-body-md font-medium">${sub.milestone}</td>
                                <td class="px-6 py-4 text-text-muted">${sub.date}</td>
                                <td class="px-6 py-4"><span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">${sub.status}</span></td>
                                <td class="px-6 py-4">${actionBtn}</td>
                            </tr>
                        `;
                    }).join('');
                }

                // Milestone Timeline
                const timeline = document.querySelector('.relative.space-y-8');
                if (timeline && data.timeline) {
                    timeline.innerHTML = data.timeline.map(item => {
                        const isDone = item.status === 'Done';
                        const icon = isDone ? 'check' : 'hourglass_empty';
                        const iconColor = isDone ? 'bg-success-emerald text-white' : 'bg-surface-container-highest text-text-muted border border-outline-variant';
                        const statusColor = isDone ? 'text-success-emerald' : 'text-text-muted';
                        return `
                            <div class="relative flex items-center">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full ${iconColor} shadow-md z-10">
                                    <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">${icon}</span>
                                </div>
                                <div class="ml-4">
                                    <p class="font-body-md font-bold">${item.title}</p>
                                    <p class="font-label-sm ${statusColor}">${item.status}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // Latest Feedback Card
                const feedbackCard = document.querySelector('.bg-primary-container');
                if (feedbackCard) {
                    if (data.feedback) {
                        feedbackCard.style.display = 'block';
                        feedbackCard.querySelector('p.font-body-md').textContent = `"${data.feedback.comment}"`;
                        feedbackCard.querySelector('img').src = data.feedback.avatar;
                        feedbackCard.querySelector('.font-label-sm.font-bold').textContent = data.feedback.facultyName;
                        feedbackCard.querySelector('.text-\\[11px\\].opacity-70').textContent = new Date(data.feedback.date).toLocaleDateString();
                    } else {
                        feedbackCard.style.display = 'none';
                    }
                }

                // Team Members List
                const teamContainer = document.querySelector('.lg\\:col-span-4 > div:last-child .space-y-4');
                if (teamContainer && data.team) {
                    teamContainer.innerHTML = data.team.map(m => `
                        <div class="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg transition-all">
                            <img alt="${m.name}" class="w-10 h-10 rounded-full object-cover" src="${m.avatar}"/>
                            <div class="flex-1">
                                <p class="font-body-md font-semibold">${m.name}</p>
                                <p class="font-label-sm text-text-muted">${m.regNo}</p>
                            </div>
                            <span class="w-2 h-2 rounded-full bg-success-emerald"></span>
                        </div>
                    `).join('');
                }
            } else if (activePage === 'project') {
                const data = await fetchAPI('/students/dashboard');
                const card = document.querySelector('.bento-card');
                if (card) {
                    card.innerHTML = `
                        <div class="p-6 space-y-6">
                            <div class="border-b pb-4">
                                <h3 class="text-2xl font-bold text-primary">${data.student.projectTitle}</h3>
                                <p class="text-sm text-on-surface-variant mt-1">Domain: <span class="font-semibold">${data.student.projectDomain}</span></p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-surface-container-low p-4 rounded-lg"><span class="text-xs text-on-surface-variant">Supervisor</span><p class="font-bold mt-1 text-secondary text-lg">${data.student.supervisorName}</p></div>
                                <div class="bg-surface-container-low p-4 rounded-lg"><span class="text-xs text-on-surface-variant">Co-Supervisor</span><p class="font-bold mt-1 text-secondary text-lg">${data.student.coSupervisorName}</p></div>
                                <div class="bg-surface-container-low p-4 rounded-lg"><span class="text-xs text-on-surface-variant">Group ID</span><p class="font-bold mt-1 text-lg">${data.student.groupName}</p></div>
                                <div class="bg-surface-container-low p-4 rounded-lg"><span class="text-xs text-on-surface-variant">Project Status</span><p class="font-bold mt-1 text-lg text-success-emerald capitalize">${data.student.projectStatus}</p></div>
                            </div>
                        </div>
                    `;
                }
            } else if (activePage === 'group') {
                const data = await fetchAPI('/students/dashboard');
                const card = document.querySelector('.bento-card');
                if (card) {
                    const membersHtml = data.team.map(m => `
                        <div class="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                            <img alt="${m.name}" class="w-16 h-16 rounded-full object-cover border-2 border-primary/20" src="${m.avatar}"/>
                            <div>
                                <h4 class="text-lg font-bold text-primary">${m.name}</h4>
                                <p class="text-sm text-on-surface-variant">${m.regNo}</p>
                            </div>
                        </div>
                    `).join('');
                    card.innerHTML = `
                        <div class="p-6 space-y-6">
                            <div class="border-b pb-4">
                                <h3 class="text-xl font-bold text-primary">${data.student.groupName}</h3>
                                <p class="text-sm text-on-surface-variant">Members list for your Final Year Project group.</p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${membersHtml}</div>
                        </div>
                    `;
                }
            } else if (activePage === 'milestones') {
                const milestones = await fetchAPI('/students/milestones');
                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = milestones.map(m => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4">${m.MilestoneID}</td>
                            <td class="px-6 py-4 font-semibold text-primary">${m.Title}</td>
                            <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-bold ${m.Status === 'Active' ? 'bg-success-emerald/10 text-success-emerald' : 'bg-outline-variant/30 text-text-muted'}">${m.Status}</span></td>
                            <td class="px-6 py-4 text-text-muted">${new Date(m.DueDate).toLocaleDateString()}</td>
                            <td class="px-6 py-4 font-bold text-secondary">${m.Weightage}%</td>
                        </tr>
                    `).join('');
                }
            } else if (activePage === 'submissions') {
                const data = await fetchAPI('/students/dashboard');
                const projectId = data.student.projectId;
                const milestones = await fetchAPI('/students/milestones');

                const loadHistory = async () => {
                    const tbody = document.querySelector('table tbody');
                    if (tbody && projectId) {
                        const subs = await fetchAPI(`/submissions/history/${projectId}/all`); // returns history
                        tbody.innerHTML = subs.map(sub => {
                            const statusCls = sub.Status === 'Reviewed' 
                                ? 'bg-success-emerald/10 text-success-emerald' 
                                : 'bg-secondary-container/10 text-secondary-container';
                            const fileLink = sub.FileID 
                                ? `<a href="../api/submissions/download/${sub.FileID}" class="text-primary hover:underline font-bold flex items-center gap-1"><span class="material-symbols-outlined text-sm">download</span>Download File</a>`
                                : 'No file';
                            return `
                                <tr class="hover:bg-surface-container-low transition-colors">
                                    <td class="px-6 py-4 font-medium">${sub.MilestoneTitle}</td>
                                    <td class="px-6 py-4">${sub.SubmissionVersion}</td>
                                    <td class="px-6 py-4 text-text-muted">${new Date().toLocaleDateString()}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-0.5 rounded-full ${statusCls} text-xs font-bold">${sub.Status}</span></td>
                                    <td class="px-6 py-4">${fileLink}</td>
                                    <td class="px-6 py-4 text-center">-</td>
                                </tr>
                            `;
                        }).join('');
                    }
                };

                await loadHistory();

                const uploadBtn = document.querySelector('header button') || document.querySelector('button.bg-primary');
                if (uploadBtn) {
                    uploadBtn.onclick = () => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                            <div class="bg-surface-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-6">
                                <h3 class="font-headline-sm text-primary border-b pb-2">New Milestone Submission</h3>
                                <form id="upload-form" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-bold mb-1">Select Milestone</label>
                                        <select name="milestoneId" class="w-full rounded-xl border-outline-variant bg-surface" required>
                                            ${milestones.map(m => `<option value="${m.MilestoneID}">${m.Title}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-bold mb-1">Submission Type</label>
                                        <select name="submissionType" class="w-full rounded-xl border-outline-variant bg-surface" required>
                                            <option>Document</option>
                                            <option>Code</option>
                                            <option>Presentation</option>
                                            <option>Zip File</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-bold mb-1">Select File (.pdf, .docx, .pptx, .zip)</label>
                                        <input type="file" name="submissionFile" class="w-full" required accept=".pdf,.docx,.pptx,.zip"/>
                                    </div>
                                    <div class="flex gap-2 justify-end pt-4">
                                        <button type="button" class="px-4 py-2 border rounded-xl" id="close-modal">Cancel</button>
                                        <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold">Submit</button>
                                    </div>
                                </form>
                            </div>
                        `;
                        document.body.appendChild(modal);

                        modal.querySelector('#close-modal').onclick = () => modal.remove();
                        modal.querySelector('form').onsubmit = async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            formData.append('projectId', projectId);

                            try {
                                const base = getBasePath();
                                const response = await fetch(base + 'api/submissions', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}` },
                                    body: formData
                                });
                                if (!response.ok) throw new Error('Submission failed');
                                alert('File submitted successfully!');
                                modal.remove();
                                await loadHistory();
                            } catch (err) {
                                alert(err.message);
                            }
                        };
                    };
                }
            } else if (activePage === 'feedback') {
                const feedbacks = await fetchAPI('/students/feedback');
                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = feedbacks.map(fb => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4 text-text-muted">${new Date(fb.date).toLocaleDateString()}</td>
                            <td class="px-6 py-4 font-bold text-primary">${fb.milestone}</td>
                            <td class="px-6 py-4 font-medium">${fb.facultyName}</td>
                            <td class="px-6 py-4 text-on-surface-variant">${fb.comments}</td>
                            <td class="px-6 py-4"><span class="px-2 py-0.5 rounded-full bg-secondary-container/10 text-secondary-container text-xs font-bold">${fb.type}</span></td>
                        </tr>
                    `).join('');
                }
            } else if (activePage === 'results') {
                const data = await fetchAPI('/students/results');
                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = data.results.map(r => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4 font-medium text-primary">${r.criteria}</td>
                            <td class="px-6 py-4 text-text-muted">${r.maxMarks}</td>
                            <td class="px-6 py-4 font-bold text-success-emerald">${r.obtainedMarks}</td>
                            <td class="px-6 py-4 text-on-surface-variant">${r.remarks || '-'}</td>
                        </tr>
                    `).join('');

                    const totalRow = document.createElement('tr');
                    totalRow.className = 'bg-surface-container-low font-bold border-t-2 border-outline-variant';
                    totalRow.innerHTML = `
                        <td class="px-6 py-4">Total Percentage: ${data.percentage}%</td>
                        <td class="px-6 py-4">${data.totalMax}</td>
                        <td class="px-6 py-4 text-success-emerald">${data.totalObtained}</td>
                        <td class="px-6 py-4"></td>
                    `;
                    tbody.appendChild(totalRow);
                }
            }
        } else if (role === 'faculty') {
            if (activePage === 'dashboard') {
                const data = await fetchAPI('/faculty/dashboard');
                const stats = document.querySelectorAll('.grid > div p.font-headline-sm');
                if (stats.length >= 4) {
                    stats[0].textContent = String(data.stats.assignedProjects).padStart(2, '0');
                    stats[1].textContent = String(data.stats.pendingReviews).padStart(2, '0');
                    stats[2].textContent = String(data.stats.reviewedSubmissions).padStart(2, '0');
                    stats[3].textContent = String(data.stats.upcomingEvaluations).padStart(2, '0');
                }

                const tbody = document.querySelector('table tbody');
                if (tbody && data.projects) {
                    tbody.innerHTML = data.projects.map(p => {
                        const riskColor = p.risk === 'High' ? 'text-error bg-error/10' : (p.risk === 'Medium' ? 'text-warning-amber bg-warning-amber/10' : 'text-success-emerald bg-success-emerald/10');
                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-unit-lg py-4 font-label-md text-main">${p.title}</td>
                                <td class="px-unit-lg py-4 text-body-sm text-on-surface-variant">${p.groupName}</td>
                                <td class="px-unit-lg py-4"><span class="bg-secondary-fixed text-on-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">${p.activeMilestone}</span></td>
                                <td class="px-unit-lg py-4 w-32">
                                    <div class="flex items-center gap-2">
                                        <div class="progress-bar-container flex-1"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
                                        <span class="font-label-sm">${p.progress}%</span>
                                    </div>
                                </td>
                                <td class="px-unit-lg py-4"><span class="${riskColor} px-3 py-1 rounded-full text-[12px] font-bold">${p.risk}</span></td>
                            </tr>
                        `;
                    }).join('');
                }

                const queueContainer = document.querySelector('.bg-surface-white.rounded-xl.custom-shadow.border .space-y-4');
                if (queueContainer && data.queue) {
                    queueContainer.innerHTML = data.queue.map(sub => `
                        <div class="p-unit-md bg-surface-container-low rounded-lg border border-outline-variant/20 hover:border-primary/30 transition-all">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-surface-white rounded-lg flex items-center justify-center text-primary"><span class="material-symbols-outlined">description</span></div>
                                    <div>
                                        <p class="font-label-md text-main truncate w-32">${sub.fileName}</p>
                                        <p class="text-[12px] text-on-surface-variant">${sub.groupName} • ${sub.milestone}</p>
                                    </div>
                                </div>
                                <a href="submission-review.html?id=${sub.submissionId}" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-label-sm hover:opacity-90">Review</a>
                            </div>
                        </div>
                    `).join('');
                }
            } else if (activePage === 'projects') {
                const projects = await fetchAPI('/faculty/projects');
                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = projects.map(p => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4">${p.ProjectID}</td>
                            <td class="px-6 py-4 font-semibold text-primary">${p.Title}</td>
                            <td class="px-6 py-4 text-text-muted">${p.Domain}</td>
                            <td class="px-6 py-4"><span class="px-2 py-0.5 rounded-full bg-success-emerald/10 text-success-emerald text-xs font-bold">${p.Status}</span></td>
                            <td class="px-6 py-4">${p.GroupName || 'No Group'}</td>
                            <td class="px-6 py-4 text-sm text-on-surface-variant">${p.members || 'No members'}</td>
                        </tr>
                    `).join('');
                }
            } else if (activePage === 'groups') {
                const groups = await fetchAPI('/faculty/groups');
                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = groups.map(g => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4">${g.groupId}</td>
                            <td class="px-6 py-4 font-semibold text-primary">${g.groupName}</td>
                            <td class="px-6 py-4 text-sm text-on-surface-variant">${g.students}</td>
                            <td class="px-6 py-4 text-text-muted">${g.projectTitle}</td>
                        </tr>
                    `).join('');
                }
            } else if (activePage === 'submissions') {
                // If it is the Review page
                if (window.location.pathname.includes('submission-review.html')) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const subId = urlParams.get('id');
                    if (!subId) {
                        alert('No submission specified');
                        window.location.href = 'submissions.html';
                        return;
                    }

                    const data = await fetchAPI(`/submissions/${subId}`);

                    // Update UI Details
                    const subNameEl = document.querySelector('section header h2');
                    if (subNameEl) subNameEl.textContent = data.submission.fileName;

                    const titleEl = document.querySelector('aside h3');
                    if (titleEl) titleEl.textContent = data.submission.projectTitle;

                    const groupNameEl = document.querySelector('aside p span');
                    if (groupNameEl) groupNameEl.textContent = data.submission.groupName;

                    const versionEl = document.querySelector('aside span.bg-secondary-fixed');
                    if (versionEl) versionEl.textContent = `Version ${data.submission.version}`;

                    // Left PDF Canvas Abstract Mockup
                    const docTitleEl = document.querySelector('.pdf-canvas h3');
                    const docProjEl = document.querySelector('.pdf-canvas p');
                    const docAbstractEl = document.querySelector('.pdf-canvas .text-sm');
                    if (docTitleEl) docTitleEl.textContent = data.submission.milestoneTitle;
                    if (docProjEl) docProjEl.textContent = data.submission.projectTitle;
                    if (docAbstractEl) docAbstractEl.textContent = `This is a mockup preview of the submitted file: ${data.submission.fileName}. You can download the physical file directly by clicking the download icon above.`;

                    // Bind download button
                    const downloadBtn = document.querySelector('section header button:has(span:contains("download"))') || document.querySelector('section header .material-symbols-outlined:contains("download")')?.parentElement;
                    if (downloadBtn && data.submission.fileId) {
                        downloadBtn.onclick = () => {
                            window.location.href = `../api/submissions/download/${data.submission.fileId}`;
                        };
                    }

                    // Populate comments history
                    const commentsContainer = document.querySelector('aside .overflow-y-auto');
                    if (commentsContainer) {
                        commentsContainer.innerHTML = data.history.map(fb => `
                            <div class="flex gap-3">
                                <img alt="Supervisor" class="w-8 h-8 rounded-full object-cover" src="${fb.avatar}"/>
                                <div class="flex-1">
                                    <div class="flex justify-between items-baseline mb-1"><span class="text-sm font-bold text-primary">${fb.facultyName}</span><span class="text-[10px] text-on-surface-variant">${new Date(fb.date).toLocaleDateString()}</span></div>
                                    <div class="bg-primary-container/10 border border-primary/20 rounded-xl p-3 text-sm text-on-primary-fixed-variant">${fb.comment} (${fb.type})</div>
                                </div>
                            </div>
                        `).join('');
                    }

                    // Bind feedback submit actions
                    const commentTextarea = document.querySelector('textarea');
                    const feedbackSelect = document.querySelector('select');
                    const approveBtn = document.querySelector('button:contains("Approve")') || document.querySelector('aside button.bg-success-emerald');
                    const revisionBtn = document.querySelector('button:contains("Revision")') || document.querySelector('aside button.bg-warning-amber');
                    const rejectBtn = document.querySelector('button:contains("Reject")') || document.querySelector('aside button.bg-error');

                    const submitFeedback = async (type) => {
                        const comment = commentTextarea.value.trim();
                        const feedbackSelVal = feedbackSelect ? feedbackSelect.value : 'Review';
                        if (!comment) {
                            alert('Please write comments before saving feedback');
                            return;
                        }

                        try {
                            await fetchAPI('/faculty/feedback', {
                                method: 'POST',
                                body: {
                                    submissionId: subId,
                                    comment: `${comment} [Category: ${feedbackSelVal}]`,
                                    feedbackType: type
                                }
                            });
                            alert('Feedback submitted successfully!');
                            window.location.href = 'submissions.html';
                        } catch (err) {
                            alert(err.message);
                        }
                    };

                    if (approveBtn) approveBtn.onclick = () => submitFeedback('Approved');
                    if (revisionBtn) revisionBtn.onclick = () => submitFeedback('Revision Required');
                    if (rejectBtn) rejectBtn.onclick = () => submitFeedback('Rejected');

                } else {
                    // Normal faculty submissions list
                    const subs = await fetchAPI('/faculty/submissions');
                    const tbody = document.querySelector('table tbody');
                    if (tbody) {
                        tbody.innerHTML = subs.map(sub => `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-6 py-4 font-medium text-primary">${sub.FileName || 'No File'}</td>
                                <td class="px-6 py-4">${sub.GroupName}</td>
                                <td class="px-6 py-4">${sub.MilestoneTitle}</td>
                                <td class="px-6 py-4 text-text-muted">v${sub.SubmissionVersion}</td>
                                <td class="px-6 py-4"><span class="px-2 py-0.5 rounded-full ${sub.Status === 'Reviewed' ? 'bg-success-emerald/10 text-success-emerald' : 'bg-secondary-container/10 text-secondary-container'} text-xs font-bold">${sub.Status}</span></td>
                                <td class="px-6 py-4"><a href="submission-review.html?id=${sub.SubmissionID}" class="text-primary font-bold hover:underline">Review</a></td>
                            </tr>
                        `).join('');
                    }
                }
            }
        } else if (role === 'evaluator') {
            if (activePage === 'dashboard' || activePage === 'evaluations') {
                const data = await fetchAPI('/evaluations/dashboard');

                // Stats Cards
                const statsHeaders = document.querySelectorAll('.grid h3');
                if (statsHeaders.length >= 4) {
                    statsHeaders[0].textContent = String(data.stats.assigned).padStart(2, '0');
                    statsHeaders[1].textContent = String(data.stats.pending).padStart(2, '0');
                    statsHeaders[2].textContent = String(data.stats.completed).padStart(2, '0');
                    statsHeaders[3].innerHTML = `${data.stats.averageMarks}<span class="text-headline-sm ml-1">%</span>`;
                }

                // Populate Today's Evaluation Schedule
                const scheduleContainer = document.querySelector('.divide-y');
                if (scheduleContainer && activePage === 'dashboard') {
                    const scheduledEvals = data.evaluations.filter(ev => ev.status === 'Scheduled');
                    if (scheduledEvals.length === 0) {
                        scheduleContainer.innerHTML = `<div class="p-6 text-center text-text-muted">No evaluations scheduled currently.</div>`;
                    } else {
                        scheduleContainer.innerHTML = scheduledEvals.map(ev => `
                            <div class="p-6 hover:bg-surface-container transition-colors">
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div class="flex gap-4">
                                        <div class="flex flex-col items-center justify-center bg-surface-container-high rounded-xl p-3 w-20">
                                            <p class="font-label-sm text-on-surface-variant uppercase">Date</p>
                                            <p class="font-headline-sm text-primary text-sm font-bold">${new Date(ev.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                                        </div>
                                        <div>
                                            <p class="font-label-sm font-bold text-primary mb-1">GROUP: ${ev.groupName}</p>
                                            <h5 class="font-body-lg font-bold mb-1">${ev.projectTitle}</h5>
                                            <p class="font-body-sm text-on-surface-variant flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[16px]">flag</span> Milestone: ${ev.milestone}
                                            </p>
                                        </div>
                                    </div>
                                    <a href="marking.html?id=${ev.evaluationId}" class="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md hover:shadow-lg text-center">Prepare Rubric & Mark</a>
                                </div>
                            </div>
                        `).join('');
                    }
                }

                // Populate Evaluation History
                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = data.evaluations.map(ev => {
                        const statusCls = ev.status === 'Completed' ? 'bg-success-emerald/10 text-success-emerald' : 'bg-warning-amber/10 text-warning-amber';
                        const actionBtn = ev.status === 'Scheduled' 
                            ? `<a href="marking.html?id=${ev.evaluationId}" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Mark Sheet</a>`
                            : `<span class="text-text-muted text-xs">Marked</span>`;
                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="p-4 font-body-sm font-bold">${ev.groupName}</td>
                                <td class="p-4 font-body-sm">${ev.projectTitle}</td>
                                <td class="p-4 font-body-sm text-text-muted">${new Date(ev.date).toLocaleDateString()}</td>
                                <td class="p-4 font-body-sm">${ev.milestone}</td>
                                <td class="p-4"><span class="px-2.5 py-0.5 rounded-full ${statusCls} text-[11px] font-bold uppercase">${ev.status}</span></td>
                                <td class="p-4 text-right">${actionBtn}</td>
                            </tr>
                        `;
                    }).join('');
                }
            } else if (activePage === 'marking') {
                const urlParams = new URLSearchParams(window.location.search);
                const evalId = urlParams.get('id');
                if (!evalId) {
                    alert('No evaluation specified');
                    window.location.href = 'dashboard.html';
                    return;
                }

                const data = await fetchAPI(`/evaluations/marking-sheet/${evalId}`);

                // Render project details
                const detailContainer = document.querySelector('.pt-24 header') || document.querySelector('main header');
                if (detailContainer) {
                    const h1 = detailContainer.querySelector('h1') || detailContainer.querySelector('.text-primary');
                    if (h1) h1.textContent = `Marking Sheet: ${data.evaluation.projectTitle}`;
                    const p = detailContainer.querySelector('p');
                    if (p) p.textContent = `Evaluating Group: ${data.evaluation.groupName} • Milestone: ${data.evaluation.milestone}`;
                }

                // Render rubric criteria
                const container = document.querySelector('.grid.gap-gutter') || document.querySelector('.grid') || document.querySelector('main > div:last-child');
                if (container) {
                    container.innerHTML = `
                        <div class="bento-card p-6 space-y-6 text-left">
                            <h3 class="font-headline-sm text-primary mb-4">Rubric Evaluation</h3>
                            <div class="space-y-4" id="rubric-rows">
                                ${data.rubrics.map(r => `
                                    <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2 rubric-row" data-criteria-id="${r.criteriaId}">
                                        <div class="flex justify-between items-center">
                                            <h4 class="font-bold text-main">${r.criteriaName} (Max: ${r.maxMarks})</h4>
                                            <input type="number" class="w-24 px-3 py-1.5 border rounded-lg score-input" placeholder="Score" max="${r.maxMarks}" min="0" step="0.5" value="${r.obtainedMarks ?? ''}" required />
                                        </div>
                                        <p class="text-xs text-on-surface-variant">${r.description || 'No description available.'}</p>
                                        <textarea class="w-full text-xs p-2 border rounded-lg remarks-input" placeholder="Add remarks for this criteria...">${r.remarks ?? ''}</textarea>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flex justify-end gap-2 pt-4">
                                <a href="dashboard.html" class="px-6 py-2.5 border rounded-xl">Cancel</a>
                                <button id="save-marks-btn" class="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:opacity-90">Save Marks</button>
                            </div>
                        </div>
                    `;

                    // Bind Save Marks button
                    document.getElementById('save-marks-btn').onclick = async () => {
                        const rows = document.querySelectorAll('.rubric-row');
                        const marks = [];
                        for (const r of rows) {
                            const criteriaId = r.dataset.criteriaId;
                            const scoreInput = r.querySelector('.score-input');
                            const remarksInput = r.querySelector('.remarks-input');
                            const obtainedMarks = parseFloat(scoreInput.value);

                            if (isNaN(obtainedMarks)) {
                                alert('Please provide scores for all criteria fields');
                                return;
                            }
                            marks.push({
                                criteriaId,
                                obtainedMarks,
                                remarks: remarksInput.value.trim()
                            });
                        }

                        try {
                            await fetchAPI('/evaluations/record-marks', {
                                method: 'POST',
                                body: {
                                    evaluationId: evalId,
                                    marks
                                }
                            });
                            alert('Evaluation marks recorded successfully!');
                            window.location.href = 'dashboard.html';
                        } catch (err) {
                            alert(err.message);
                        }
                    };
                }
            }
        } else if (role === 'coordinator') {
            if (activePage === 'dashboard') {
                const data = await fetchAPI('/dashboard/stats');

                // Stats Cards
                const statsValues = document.querySelectorAll('.grid .font-display-lg');
                if (statsValues.length >= 4) {
                    statsValues[0].textContent = String(data.stats.students);
                    statsValues[1].textContent = String(data.stats.faculty);
                    statsValues[2].textContent = String(data.stats.groups);
                    statsValues[3].textContent = String(data.stats.projects);
                }

                // Domain Distribution count
                const totalProjectsEl = document.querySelector('.relative.w-48.h-48 span.text-\\[24px\\]') || document.querySelector('.relative.w-48.h-48 .text-\\[24px\\]');
                if (totalProjectsEl) {
                    totalProjectsEl.textContent = String(data.stats.projects);
                }

                // Faculty Supervision Load
                const loadContainer = document.querySelector('.space-y-6');
                if (loadContainer && data.facultyLoad) {
                    loadContainer.innerHTML = data.facultyLoad.slice(0, 3).map(f => {
                        const pct = Math.min(100, (f.count / 4) * 100);
                        const progressColor = pct >= 100 ? 'bg-error' : (pct >= 75 ? 'bg-warning-amber' : 'bg-success-emerald');
                        const textColor = pct >= 100 ? 'text-error' : (pct >= 75 ? 'text-warning-amber' : 'text-success-emerald');
                        return `
                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="font-label-md">${f.FacultyName}</span>
                                    <span class="font-label-md font-bold ${textColor}">${f.count} / 4 Groups</span>
                                </div>
                                <div class="w-full bg-surface-container-highest rounded-full h-2">
                                    <div class="${progressColor} h-2 rounded-full" style="width:${pct}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // Recent Activity
                const activityContainer = document.querySelector('.divide-y') || document.querySelector('.relative.before\\:absolute') || document.querySelector('.space-y-6.relative');
                if (activityContainer && data.recentActivity) {
                    activityContainer.innerHTML = data.recentActivity.map(act => `
                        <div class="relative pl-8 mb-6">
                            <div class="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                                <span class="material-symbols-outlined text-[14px] text-on-primary">upload_file</span>
                            </div>
                            <div>
                                <p class="font-body-sm"><span class="font-bold">${act.GroupName}</span> submitted ${act.MilestoneTitle} (${act.SubmissionVersion})</p>
                                <p class="text-[12px] text-on-surface-variant mt-0.5">File: ${act.FileName || 'No file attached'}</p>
                            </div>
                        </div>
                    `).join('');
                }
            } else if (activePage === 'students') {
                const students = await fetchAPI('/students');
                const batches = await fetchAPI('/batches');

                // Adjust table headers
                const thead = document.querySelector('table thead');
                if (thead) {
                    thead.innerHTML = `<tr>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Registration No</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Name</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Email</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Group</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                    </tr>`;
                }

                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = students.map(s => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4 font-semibold text-primary">${s.RegistrationNo}</td>
                            <td class="px-6 py-4 font-semibold">${s.FirstName} ${s.LastName || ''}</td>
                            <td class="px-6 py-4 text-text-muted">${s.Email}</td>
                            <td class="px-6 py-4">${s.GroupName || 'No Group'}</td>
                            <td class="px-6 py-4 text-center">
                                <button class="text-error font-bold hover:underline delete-btn" data-id="${s.StudentID}">Delete</button>
                            </td>
                        </tr>
                    `).join('');

                    // Bind delete buttons
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.onclick = async () => {
                            if (confirm('Are you sure you want to delete this student?')) {
                                try {
                                    await fetchAPI(`/students/${btn.dataset.id}`, { method: 'DELETE' });
                                    alert('Student deleted successfully!');
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message);
                                }
                            }
                        };
                    });
                }

                // Add Student Button and Modal
                const header = document.querySelector('header');
                if (header) {
                    let actionDiv = header.querySelector('div:last-child');
                    if (!actionDiv || actionDiv === header.firstElementChild) {
                        actionDiv = document.createElement('div');
                        header.appendChild(actionDiv);
                    }
                    actionDiv.innerHTML = `<button id="add-student-btn" class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-md"><span class="material-symbols-outlined text-[18px]">person_add</span> Add Student</button>`;

                    document.getElementById('add-student-btn').onclick = () => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                            <div class="bg-surface-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-left">
                                <h3 class="font-headline-sm text-primary border-b pb-2">Add Student</h3>
                                <form id="add-student-form" class="space-y-3">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div><label class="block text-xs font-bold mb-1">First Name</label><input type="text" name="firstName" class="w-full text-sm rounded-lg" required/></div>
                                        <div><label class="block text-xs font-bold mb-1">Last Name</label><input type="text" name="lastName" class="w-full text-sm rounded-lg"/></div>
                                    </div>
                                    <div><label class="block text-xs font-bold mb-1">Email</label><input type="email" name="email" class="w-full text-sm rounded-lg" required/></div>
                                    <div><label class="block text-xs font-bold mb-1">CNIC</label><input type="text" name="cnic" class="w-full text-sm rounded-lg" placeholder="e.g. 35201-1234567-1" required/></div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div><label class="block text-xs font-bold mb-1">Gender</label><select name="gender" class="w-full text-sm rounded-lg"><option>Male</option><option>Female</option><option>Other</option></select></div>
                                        <div><label class="block text-xs font-bold mb-1">DOB</label><input type="date" name="dob" class="w-full text-sm rounded-lg" required/></div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div><label class="block text-xs font-bold mb-1">Reg No</label><input type="text" name="registrationNo" class="w-full text-sm rounded-lg" required/></div>
                                        <div>
                                            <label class="block text-xs font-bold mb-1">Batch</label>
                                            <select name="batchId" class="w-full text-sm rounded-lg" required>
                                                ${batches.map(b => `<option value="${b.BatchID}">${b.BatchName}</option>`).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="flex gap-2 justify-end pt-4">
                                        <button type="button" class="px-4 py-2 border rounded-xl" id="close-modal">Cancel</button>
                                        <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold">Save</button>
                                    </div>
                                </form>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        modal.querySelector('#close-modal').onclick = () => modal.remove();
                        modal.querySelector('form').onsubmit = async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const body = Object.fromEntries(formData.entries());
                            try {
                                await fetchAPI('/students', {
                                    method: 'POST',
                                    body
                                });
                                alert('Student created successfully!');
                                modal.remove();
                                window.location.reload();
                            } catch (err) {
                                alert(err.message);
                            }
                        };
                    };
                }
            } else if (activePage === 'faculty') {
                const faculty = await fetchAPI('/faculty');
                const departments = await fetchAPI('/departments');

                // Adjust table headers
                const thead = document.querySelector('table thead');
                if (thead) {
                    thead.innerHTML = `<tr>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Employee No</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Name</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Email</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Department</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                    </tr>`;
                }

                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = faculty.map(f => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4 font-semibold text-primary">${f.EmployeeNo}</td>
                            <td class="px-6 py-4 font-semibold">${f.FirstName} ${f.LastName || ''}</td>
                            <td class="px-6 py-4 text-text-muted">${f.Email}</td>
                            <td class="px-6 py-4">${f.DepartmentName}</td>
                            <td class="px-6 py-4 text-center">
                                <button class="text-error font-bold hover:underline delete-btn" data-id="${f.FacultyID}">Delete</button>
                            </td>
                        </tr>
                    `).join('');

                    // Bind delete buttons
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.onclick = async () => {
                            if (confirm('Are you sure you want to delete this faculty member?')) {
                                try {
                                    await fetchAPI(`/faculty/${btn.dataset.id}`, { method: 'DELETE' });
                                    alert('Faculty deleted successfully!');
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message);
                                }
                            }
                        };
                    });
                }

                // Add Faculty Button and Modal
                const header = document.querySelector('header');
                if (header) {
                    let actionDiv = header.querySelector('div:last-child');
                    if (!actionDiv || actionDiv === header.firstElementChild) {
                        actionDiv = document.createElement('div');
                        header.appendChild(actionDiv);
                    }
                    actionDiv.innerHTML = `<button id="add-faculty-btn" class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-md"><span class="material-symbols-outlined text-[18px]">person_add</span> Add Faculty</button>`;

                    document.getElementById('add-faculty-btn').onclick = () => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                            <div class="bg-surface-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-left">
                                <h3 class="font-headline-sm text-primary border-b pb-2">Add Faculty</h3>
                                <form id="add-faculty-form" class="space-y-3">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div><label class="block text-xs font-bold mb-1">First Name</label><input type="text" name="firstName" class="w-full text-sm rounded-lg" required/></div>
                                        <div><label class="block text-xs font-bold mb-1">Last Name</label><input type="text" name="lastName" class="w-full text-sm rounded-lg"/></div>
                                    </div>
                                    <div><label class="block text-xs font-bold mb-1">Email</label><input type="email" name="email" class="w-full text-sm rounded-lg" required/></div>
                                    <div><label class="block text-xs font-bold mb-1">CNIC</label><input type="text" name="cnic" class="w-full text-sm rounded-lg" placeholder="e.g. 35201-1234567-1" required/></div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div><label class="block text-xs font-bold mb-1">Gender</label><select name="gender" class="w-full text-sm rounded-lg"><option>Male</option><option>Female</option><option>Other</option></select></div>
                                        <div><label class="block text-xs font-bold mb-1">DOB</label><input type="date" name="dob" class="w-full text-sm rounded-lg" required/></div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div><label class="block text-xs font-bold mb-1">Employee No</label><input type="text" name="employeeNo" class="w-full text-sm rounded-lg" required/></div>
                                        <div><label class="block text-xs font-bold mb-1">Designation</label><input type="text" name="designation" class="w-full text-sm rounded-lg" required/></div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold mb-1">Department</label>
                                        <select name="departmentId" class="w-full text-sm rounded-lg" required>
                                            ${departments.map(d => `<option value="${d.DepartmentID}">${d.DepartmentName}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="flex gap-2 justify-end pt-4">
                                        <button type="button" class="px-4 py-2 border rounded-xl" id="close-modal">Cancel</button>
                                        <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold">Save</button>
                                    </div>
                                </form>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        modal.querySelector('#close-modal').onclick = () => modal.remove();
                        modal.querySelector('form').onsubmit = async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const body = Object.fromEntries(formData.entries());
                            try {
                                await fetchAPI('/faculty', {
                                    method: 'POST',
                                    body
                                });
                                alert('Faculty member created successfully!');
                                modal.remove();
                                window.location.reload();
                            } catch (err) {
                                alert(err.message);
                            }
                        };
                    };
                }
            } else if (activePage === 'groups') {
                const groups = await fetchAPI('/groups');
                const batches = await fetchAPI('/batches');
                const students = await fetchAPI('/students');

                // Adjust table headers
                const thead = document.querySelector('table thead');
                if (thead) {
                    thead.innerHTML = `<tr>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Group Name</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Members</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Project Assigned</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                    </tr>`;
                }

                // Populate list
                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = groups.map(g => `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-6 py-4 font-bold text-primary">${g.groupName}</td>
                            <td class="px-6 py-4 font-semibold">${g.students.join(', ')}</td>
                            <td class="px-6 py-4 text-text-muted">${g.projectTitle}</td>
                            <td class="px-6 py-4 text-center">
                                <button class="text-error font-bold hover:underline disband-btn" data-id="${g.groupId}">Disband</button>
                            </td>
                        </tr>
                    `).join('');

                    // Bind disband buttons
                    document.querySelectorAll('.disband-btn').forEach(btn => {
                        btn.onclick = async () => {
                            if (confirm('Are you sure you want to disband this group? Students will be unlinked.')) {
                                try {
                                    await fetchAPI(`/groups/${btn.dataset.id}`, { method: 'DELETE' });
                                    alert('Group disbanded successfully!');
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message);
                                }
                            }
                        };
                    });
                }

                // Populate Create Group Wizard
                const wizardSelects = document.querySelectorAll('.bento-card select');
                if (wizardSelects.length >= 3) {
                    const batchSelect = wizardSelects[0];
                    const student1Select = wizardSelects[1];
                    const student2Select = wizardSelects[2];

                    // Populate batches
                    batchSelect.innerHTML = batches.map(b => `<option value="${b.BatchID}">${b.BatchName}</option>`).join('');

                    const updateStudentsDropdown = () => {
                        const selectedBatchId = batchSelect.value;
                        const ungrouped = students.filter(s => s.BatchID == selectedBatchId && !s.GroupID);

                        const opts = ungrouped.map(s => `<option value="${s.StudentID}">${s.FirstName} ${s.LastName || ''} (${s.RegistrationNo})</option>`).join('');
                        student1Select.innerHTML = `<option value="">-- Select Student 1 --</option>` + opts;
                        student2Select.innerHTML = `<option value="">-- Select Student 2 --</option>` + opts;
                    };

                    batchSelect.onchange = updateStudentsDropdown;
                    updateStudentsDropdown(); // initial run

                    // Bind Approve Group button (Step 4 button)
                    const approveBtn = document.querySelector('.bento-card button');
                    if (approveBtn) {
                        approveBtn.onclick = async () => {
                            const student1 = student1Select.value;
                            const student2 = student2Select.value;
                            if (!student1 || !student2) {
                                alert('Please select exactly two students.');
                                return;
                            }
                            const groupName = prompt('Enter a Group Name (e.g. GRP-CS-01):');
                            if (!groupName) return;

                            try {
                                await fetchAPI('/groups', {
                                    method: 'POST',
                                    body: { groupName, studentId1: student1, studentId2: student2 }
                                });
                                alert('Group created successfully!');
                                window.location.reload();
                            } catch (err) {
                                alert(err.message);
                            }
                        };
                    }
                }
            } else if (activePage === 'projects') {
                const projects = await fetchAPI('/projects');
                const groups = await fetchAPI('/groups');

                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = projects.map(p => {
                        const statusCls = p.ProjectStatus === 'Active' ? 'text-success-emerald font-bold' : 'text-warning-amber font-bold';
                        const actionBtn = p.GroupName === 'Unassigned'
                            ? `<button class="text-primary font-bold assign-group-btn" data-project-id="${p.ProjectID}">Assign Group</button>`
                            : `<button class="text-error font-bold delete-project-btn" data-project-id="${p.ProjectID}">Delete</button>`;
                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-6 py-4 font-bold">PRJ-${String(p.ProjectID).padStart(3, '0')}</td>
                                <td class="px-6 py-4 font-semibold text-primary">${p.Title}</td>
                                <td class="px-6 py-4">${p.Domain}</td>
                                <td class="px-6 py-4"><span class="${statusCls}">${p.ProjectStatus}</span></td>
                                <td class="px-6 py-4 font-semibold">${p.GroupName}</td>
                                <td class="px-6 py-4 ${p.supervisors ? '' : 'text-error'}">${p.supervisors || 'Unassigned'}</td>
                                <td class="px-6 py-4 text-center">${actionBtn}</td>
                            </tr>
                        `;
                    }).join('');

                    // Bind delete buttons
                    document.querySelectorAll('.delete-project-btn').forEach(btn => {
                        btn.onclick = async () => {
                            if (confirm('Are you sure you want to delete this project?')) {
                                try {
                                    await fetchAPI(`/projects/${btn.dataset.projectId}`, { method: 'DELETE' });
                                    alert('Project deleted successfully!');
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message);
                                }
                            }
                        };
                    });

                    // Bind Assign Group buttons
                    document.querySelectorAll('.assign-group-btn').forEach(btn => {
                        btn.onclick = () => {
                            const projectId = btn.dataset.projectId;
                            const unassignedGroups = groups.filter(g => g.projectTitle === 'Unassigned');

                            if (unassignedGroups.length === 0) {
                                alert('All groups already have projects assigned.');
                                return;
                            }

                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                            modal.innerHTML = `
                                <div class="bg-surface-white p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 text-left">
                                    <h3 class="font-headline-sm text-primary border-b pb-2">Assign Group</h3>
                                    <form id="assign-group-form" class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Select Group</label>
                                            <select name="groupId" class="w-full rounded-xl bg-surface" required>
                                                ${unassignedGroups.map(g => `<option value="${g.groupId}">${g.groupName}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="flex gap-2 justify-end pt-2">
                                            <button type="button" class="px-4 py-2 border rounded-xl" id="close-modal">Cancel</button>
                                            <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold">Assign</button>
                                        </div>
                                    </form>
                                </div>
                            `;
                            document.body.appendChild(modal);
                            modal.querySelector('#close-modal').onclick = () => modal.remove();
                            modal.querySelector('form').onsubmit = async (e) => {
                                e.preventDefault();
                                const groupId = e.target.groupId.value;
                                try {
                                    await fetchAPI('/projects/assign', {
                                        method: 'POST',
                                        body: { projectId, groupId }
                                    });
                                    alert('Project assigned to group successfully!');
                                    modal.remove();
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message);
                                }
                            };
                        };
                    });
                }

                // Bind New Project Button
                const newProjBtn = document.querySelector('header button');
                if (newProjBtn) {
                    newProjBtn.onclick = () => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                            <div class="bg-surface-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-left">
                                <h3 class="font-headline-sm text-primary border-b pb-2">New FYP Project Proposal</h3>
                                <form id="new-project-form" class="space-y-3">
                                    <div><label class="block text-xs font-bold">Project Title</label><input type="text" name="title" class="w-full text-sm rounded-lg" required/></div>
                                    <div><label class="block text-xs font-bold">Domain</label><input type="text" name="domain" class="w-full text-sm rounded-lg" placeholder="e.g. AI, Cyber Security, IoT" required/></div>
                                    <div><label class="block text-xs font-bold">Description</label><textarea name="description" class="w-full text-sm rounded-lg h-24"></textarea></div>
                                    <div class="flex gap-2 justify-end pt-4">
                                        <button type="button" class="px-4 py-2 border rounded-xl" id="close-modal">Cancel</button>
                                        <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold">Propose</button>
                                    </div>
                                </form>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        modal.querySelector('#close-modal').onclick = () => modal.remove();
                        modal.querySelector('form').onsubmit = async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const body = Object.fromEntries(formData.entries());
                            try {
                                await fetchAPI('/projects', {
                                    method: 'POST',
                                    body
                                });
                                alert('Project proposed successfully!');
                                modal.remove();
                                window.location.reload();
                            } catch (err) {
                                alert(err.message);
                            }
                        };
                    };
                }
            } else if (activePage === 'supervision') {
                const projects = await fetchAPI('/projects');
                const faculty = await fetchAPI('/faculty');

                // Adjust headers
                const thead = document.querySelector('table thead');
                if (thead) {
                    thead.innerHTML = `<tr>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Project Title</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Assigned Group</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Supervisor</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Co-Supervisor</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                    </tr>`;
                }

                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = projects.map(p => {
                        let supervisor = 'Unassigned';
                        let coSupervisor = 'Unassigned';

                        if (p.supervisors) {
                            p.supervisors.split(', ').forEach(s => {
                                if (s.includes('(Supervisor)')) {
                                    supervisor = s.replace(' (Supervisor)', '');
                                } else if (s.includes('(Co-Supervisor)')) {
                                    coSupervisor = s.replace(' (Co-Supervisor)', '');
                                }
                            });
                        }

                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-6 py-4 font-bold text-primary">${p.Title}</td>
                                <td class="px-6 py-4">${p.GroupName}</td>
                                <td class="px-6 py-4 ${supervisor === 'Unassigned' ? 'text-error font-semibold' : ''}">${supervisor}</td>
                                <td class="px-6 py-4 ${coSupervisor === 'Unassigned' ? 'text-error font-semibold' : ''}">${coSupervisor}</td>
                                <td class="px-6 py-4 text-center">
                                    <button class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold assign-supervisors-btn" data-project-id="${p.ProjectID}">Assign</button>
                                </td>
                            </tr>
                        `;
                    }).join('');

                    // Bind Assign buttons
                    document.querySelectorAll('.assign-supervisors-btn').forEach(btn => {
                        btn.onclick = () => {
                            const projectId = btn.dataset.projectId;

                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                            modal.innerHTML = `
                                <div class="bg-surface-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-left">
                                    <h3 class="font-headline-sm text-primary border-b pb-2">Assign Supervisors</h3>
                                    <form id="assign-supervisors-form" class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Supervisor</label>
                                            <select name="supervisorId" class="w-full rounded-xl bg-surface" required>
                                                <option value="">-- Select Supervisor --</option>
                                                ${faculty.map(f => `<option value="${f.FacultyID}">${f.FirstName} ${f.LastName || ''} (${f.EmployeeNo})</option>`).join('')}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-bold mb-1">Co-Supervisor (Optional)</label>
                                            <select name="coSupervisorId" class="w-full rounded-xl bg-surface">
                                                <option value="">-- Select Co-Supervisor --</option>
                                                ${faculty.map(f => `<option value="${f.FacultyID}">${f.FirstName} ${f.LastName || ''} (${f.EmployeeNo})</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="flex gap-2 justify-end pt-2">
                                            <button type="button" class="px-4 py-2 border rounded-xl" id="close-modal">Cancel</button>
                                            <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold">Assign</button>
                                        </div>
                                    </form>
                                </div>
                            `;
                            document.body.appendChild(modal);
                            modal.querySelector('#close-modal').onclick = () => modal.remove();
                            modal.querySelector('form').onsubmit = async (e) => {
                                e.preventDefault();
                                const supervisorId = e.target.supervisorId.value;
                                const coSupervisorId = e.target.coSupervisorId.value;

                                if (supervisorId === coSupervisorId) {
                                    alert('Supervisor and Co-Supervisor cannot be the same person.');
                                    return;
                                }

                                try {
                                    await fetchAPI('/projects/assign-supervisors', {
                                        method: 'POST',
                                        body: { projectId, supervisorId, coSupervisorId }
                                    });
                                    alert('Supervisors assigned successfully!');
                                    modal.remove();
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message);
                                }
                            };
                        };
                    });
                }
            } else if (activePage === 'milestones') {
                const milestones = await fetchAPI('/milestones');
                const batches = await fetchAPI('/batches');

                // Update Stats
                const statsValues = document.querySelectorAll('.grid .text-2xl');
                if (statsValues.length >= 4) {
                    const activeCount = milestones.filter(m => m.Status === 'Active').length;
                    const upcomingCount = milestones.filter(m => m.Status === 'Upcoming').length;
                    const completedCount = milestones.filter(m => m.Status === 'Completed').length;
                    const closedCount = milestones.filter(m => m.Status === 'Closed').length;

                    statsValues[0].textContent = String(activeCount);
                    statsValues[1].textContent = String(upcomingCount);
                    statsValues[2].textContent = String(completedCount);
                    statsValues[3].textContent = String(closedCount);
                }

                // Adjust table headers
                const thead = document.querySelector('table thead');
                if (thead) {
                    thead.innerHTML = `<tr>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Milestone</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Description</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Due Date</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Weightage</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Batch</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Status</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                    </tr>`;
                }

                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = milestones.map(m => {
                        const statusCls = m.Status === 'Completed'
                            ? 'bg-success-emerald/10 text-success-emerald'
                            : (m.Status === 'Active' ? 'bg-secondary-container/10 text-secondary-container' : 'bg-outline-variant/30 text-text-muted');
                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-6 py-4 font-bold text-primary">${m.Title}</td>
                                <td class="px-6 py-4">${m.Description || 'No description'}</td>
                                <td class="px-6 py-4 text-text-muted">${new Date(m.DueDate).toLocaleDateString()}</td>
                                <td class="px-6 py-4 font-bold">${m.Weightage}%</td>
                                <td class="px-6 py-4 font-semibold">${m.BatchName}</td>
                                <td class="px-6 py-4"><span class="px-2 py-0.5 rounded-full ${statusCls} text-xs font-bold">${m.Status}</span></td>
                                <td class="px-6 py-4 text-center">
                                    <button class="text-error font-bold hover:underline delete-milestone-btn" data-id="${m.MilestoneID}">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('');

                    // Bind delete buttons
                    document.querySelectorAll('.delete-milestone-btn').forEach(btn => {
                        btn.onclick = async () => {
                            if (confirm('Are you sure you want to delete this milestone?')) {
                                try {
                                    await fetchAPI(`/milestones/${btn.dataset.id}`, { method: 'DELETE' });
                                    alert('Milestone deleted successfully!');
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message);
                                }
                            }
                        };
                    });
                }

                // Add Milestone Button and Modal
                const header = document.querySelector('header');
                if (header) {
                    let actionDiv = header.querySelector('div:last-child');
                    if (!actionDiv || actionDiv === header.firstElementChild) {
                        actionDiv = document.createElement('div');
                        header.appendChild(actionDiv);
                    }
                    actionDiv.innerHTML = `<button id="add-milestone-btn" class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-md"><span class="material-symbols-outlined text-[18px]">add</span> New Milestone</button>`;

                    document.getElementById('add-milestone-btn').onclick = () => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                            <div class="bg-surface-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-left">
                                <h3 class="font-headline-sm text-primary border-b pb-2">New Milestone</h3>
                                <form id="add-milestone-form" class="space-y-3">
                                    <div><label class="block text-xs font-bold mb-1">Title</label><input type="text" name="title" class="w-full text-sm rounded-lg" required/></div>
                                    <div><label class="block text-xs font-bold mb-1">Description</label><textarea name="description" class="w-full text-sm rounded-lg h-20"></textarea></div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div><label class="block text-xs font-bold mb-1">Due Date</label><input type="date" name="dueDate" class="w-full text-sm rounded-lg" required/></div>
                                        <div><label class="block text-xs font-bold mb-1">Weightage (%)</label><input type="number" name="weightage" min="1" max="100" class="w-full text-sm rounded-lg" required/></div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-xs font-bold mb-1">Batch</label>
                                            <select name="batchId" class="w-full text-sm rounded-lg" required>
                                                ${batches.map(b => `<option value="${b.BatchID}">${b.BatchName}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold mb-1">Status</label>
                                            <select name="status" class="w-full text-sm rounded-lg"><option>Active</option><option>Upcoming</option><option>Completed</option><option>Closed</option></select>
                                        </div>
                                    </div>
                                    <div class="flex gap-2 justify-end pt-4">
                                        <button type="button" class="px-4 py-2 border rounded-xl" id="close-modal">Cancel</button>
                                        <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold">Save</button>
                                    </div>
                                </form>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        modal.querySelector('#close-modal').onclick = () => modal.remove();
                        modal.querySelector('form').onsubmit = async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const body = Object.fromEntries(formData.entries());
                            try {
                                await fetchAPI('/milestones', {
                                    method: 'POST',
                                    body
                                });
                                alert('Milestone created successfully!');
                                modal.remove();
                                window.location.reload();
                            } catch (err) {
                                alert(err.message);
                            }
                        };
                    };
                }
            } else if (activePage === 'submissions') {
                const subs = await fetchAPI('/submissions');

                // Adjust table headers
                const thead = document.querySelector('table thead');
                if (thead) {
                    thead.innerHTML = `<tr>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">File Name</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Group</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Milestone</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Version</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Status</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                    </tr>`;
                }

                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = subs.map(sub => {
                        const statusCls = sub.Status === 'Reviewed' ? 'bg-success-emerald/10 text-success-emerald' : 'bg-secondary-container/10 text-secondary-container';
                        const actionBtn = sub.FileID
                            ? `<a href="../api/submissions/download/${sub.FileID}" class="text-primary font-bold hover:underline flex items-center justify-center gap-1"><span class="material-symbols-outlined text-sm">download</span> Download</a>`
                            : 'No file';
                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-6 py-4 font-semibold text-primary">${sub.FileName || 'No File'}</td>
                                <td class="px-6 py-4 font-semibold">${sub.GroupName}</td>
                                <td class="px-6 py-4 text-text-muted">${sub.MilestoneTitle}</td>
                                <td class="px-6 py-4 font-bold">v${sub.SubmissionVersion}</td>
                                <td class="px-6 py-4"><span class="px-2.5 py-0.5 rounded-full ${statusCls} text-xs font-bold">${sub.Status}</span></td>
                                <td class="px-6 py-4 text-center">${actionBtn}</td>
                            </tr>
                        `;
                    }).join('');
                }
            } else if (activePage === 'evaluations') {
                const evals = await fetchAPI('/evaluations');
                const groups = await fetchAPI('/groups');
                const milestones = await fetchAPI('/milestones');
                const evaluators = await fetchAPI('/evaluations/evaluators/list');

                // Adjust table headers
                const thead = document.querySelector('table thead');
                if (thead) {
                    thead.innerHTML = `<tr>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Evaluation ID</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Group</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Milestone</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Evaluators</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Date</th>
                        <th class="px-6 py-4 font-label-sm text-on-surface-variant uppercase text-left">Status</th>
                    </tr>`;
                }

                const tbody = document.querySelector('table tbody');
                if (tbody) {
                    tbody.innerHTML = evals.map(ev => {
                        const statusCls = ev.Status === 'Completed' ? 'text-success-emerald font-bold' : 'text-warning-amber font-bold';
                        return `
                            <tr class="hover:bg-surface-container-low transition-colors">
                                <td class="px-6 py-4 font-bold">EVAL-${String(ev.EvaluationID).padStart(3, '0')}</td>
                                <td class="px-6 py-4 font-semibold">${ev.GroupName}</td>
                                <td class="px-6 py-4 text-text-muted">${ev.MilestoneTitle}</td>
                                <td class="px-6 py-4 font-semibold">${ev.Evaluators}</td>
                                <td class="px-6 py-4 text-text-muted">${new Date(ev.EvaluationDate).toLocaleDateString()}</td>
                                <td class="px-6 py-4"><span class="${statusCls}">${ev.Status}</span></td>
                            </tr>
                        `;
                    }).join('');
                }

                // Bind Create Evaluation inputs
                const evalWizardSelects = document.querySelectorAll('.bento-card select');
                if (evalWizardSelects.length >= 3) {
                    const groupSelect = evalWizardSelects[0];
                    const milestoneSelect = evalWizardSelects[1];
                    const evaluatorSelect = evalWizardSelects[2];

                    groupSelect.innerHTML = groups.map(g => `<option value="${g.groupId}">${g.groupName} - ${g.projectTitle}</option>`).join('');
                    milestoneSelect.innerHTML = milestones.map(m => `<option value="${m.MilestoneID}">${m.Title} (${m.BatchName})</option>`).join('');
                    evaluatorSelect.innerHTML = evaluators.map(ev => `<option value="${ev.EvaluatorID}">${ev.FirstName} ${ev.LastName || ''} (${ev.EvaluatorType})</option>`).join('');

                    // Bind Schedule Evaluation button
                    const scheduleBtn = document.querySelector('.bento-card button');
                    if (scheduleBtn) {
                        scheduleBtn.onclick = async () => {
                            const milestoneId = milestoneSelect.value;
                            const groupId = groupSelect.value;
                            const evaluationDate = document.querySelector('.bento-card input[type="date"]').value;

                            const selectedEvaluators = Array.from(evaluatorSelect.selectedOptions).map(opt => opt.value);

                            if (!milestoneId || !groupId || !evaluationDate) {
                                alert('Please complete all scheduling fields.');
                                return;
                            }

                            if (selectedEvaluators.length === 0) {
                                alert('Please select at least one evaluator.');
                                return;
                            }

                            try {
                                const response = await fetchAPI('/evaluations/schedule', {
                                    method: 'POST',
                                    body: { milestoneId, groupId, evaluationDate }
                                });
                                const evaluationId = response.evaluationId;

                                // Assign evaluators sequentially
                                for (const evaluatorId of selectedEvaluators) {
                                    const ev = evaluators.find(x => x.EvaluatorID == evaluatorId);
                                    const role = ev.EvaluatorType === 'Internal' ? 'Internal Evaluator' : 'External Evaluator';
                                    await fetchAPI('/evaluations/assign-evaluator', {
                                        method: 'POST',
                                        body: { evaluationId, evaluatorId, evaluatorRole: role }
                                    });
                                }

                                alert('Evaluation scheduled and evaluators assigned successfully!');
                                window.location.reload();
                            } catch (err) {
                                alert(err.message);
                            }
                        };
                    }
                }
            } else if (activePage === 'reports') {
                const container = document.querySelector('.grid') || document.querySelector('main > div:last-child');
                if (container) {
                    container.innerHTML = `
                        <div class="bento-card p-6 space-y-6 text-left">
                            <h3 class="font-headline-sm text-primary mb-4">Export Academic Reports</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center">
                                    <div><h4 class="font-bold">Student Progress Report</h4><p class="text-xs text-on-surface-variant">Milestone submission progress per student</p></div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('../api/reports/export?type=progress&format=html', '_blank')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">PDF</button>
                                        <button onclick="window.location.href='../api/reports/export?type=progress&format=csv'" class="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Excel</button>
                                    </div>
                                </div>
                                <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center">
                                    <div><h4 class="font-bold">Batch Report</h4><p class="text-xs text-on-surface-variant">Student details grouped by batch</p></div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('../api/reports/export?type=batch&format=html', '_blank')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">PDF</button>
                                        <button onclick="window.location.href='../api/reports/export?type=batch&format=csv'" class="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Excel</button>
                                    </div>
                                </div>
                                <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center">
                                    <div><h4 class="font-bold">Faculty Workload Report</h4><p class="text-xs text-on-surface-variant">Supervision load per faculty member</p></div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('../api/reports/export?type=workload&format=html', '_blank')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">PDF</button>
                                        <button onclick="window.location.href='../api/reports/export?type=workload&format=csv'" class="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Excel</button>
                                    </div>
                                </div>
                                <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center">
                                    <div><h4 class="font-bold">Project Status Report</h4><p class="text-xs text-on-surface-variant">Current state of final year projects</p></div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('../api/reports/export?type=projects&format=html', '_blank')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">PDF</button>
                                        <button onclick="window.location.href='../api/reports/export?type=projects&format=csv'" class="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Excel</button>
                                    </div>
                                </div>
                                <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center">
                                    <div><h4 class="font-bold">Milestone Completion Report</h4><p class="text-xs text-on-surface-variant">Submission statistics for timeline deadlines</p></div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('../api/reports/export?type=milestones&format=html', '_blank')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">PDF</button>
                                        <button onclick="window.location.href='../api/reports/export?type=milestones&format=csv'" class="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Excel</button>
                                    </div>
                                </div>
                                <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center">
                                    <div><h4 class="font-bold">Evaluation Report</h4><p class="text-xs text-on-surface-variant">Obtained scores and evaluation sessions</p></div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('../api/reports/export?type=evaluations&format=html', '_blank')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">PDF</button>
                                        <button onclick="window.location.href='../api/reports/export?type=evaluations&format=csv'" class="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Excel</button>
                                    </div>
                                </div>
                                <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex justify-between items-center">
                                    <div><h4 class="font-bold">Final Result Report</h4><p class="text-xs text-on-surface-variant">Overall results and final score per student</p></div>
                                    <div class="flex gap-2">
                                        <button onclick="window.open('../api/reports/export?type=final&format=html', '_blank')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">PDF</button>
                                        <button onclick="window.location.href='../api/reports/export?type=final&format=csv'" class="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Excel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        }
        // ── PROFILE PAGE (all roles) ──────────────────────────────────
        if (activePage === 'profile') {
            // page-templates.js handles profile; call bootstrapProfilePage if available
            if (typeof bootstrapProfilePage === 'function') {
                await bootstrapProfilePage();
            } else {
                await loadProfilePage(fetchAPI);
            }
        }

        // ── SUPER ADMIN ──────────────────────────────────────────────
        else if (role === 'superadmin') {
            await populateSuperAdmin(activePage, fetchAPI);
        }
    } catch (err) {
        console.error('Population sync error:', err);
    }
}

// ============================================================
// SUPER ADMIN PAGE POPULATION
// ============================================================
async function populateSuperAdmin(activePage, fetchAPI) {
    if (activePage === 'dashboard') {
        try {
            const { stats, recentLogs } = await fetchAPI('/admin/stats');
            const s = Array.isArray(stats) ? stats[0] : stats;

            // Stat cards – find elements by data-stat attribute
            const setEl = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
            setEl('[data-stat="students"]',    s.total_students   ?? 0);
            setEl('[data-stat="faculty"]',     s.total_faculty    ?? 0);
            setEl('[data-stat="evaluators"]',  s.total_evaluators ?? 0);
            setEl('[data-stat="groups"]',      s.total_groups     ?? 0);
            setEl('[data-stat="projects"]',    s.total_projects   ?? 0);
            setEl('[data-stat="active_accounts"]',    s.active_accounts    ?? 0);
            setEl('[data-stat="suspended_accounts"]', s.suspended_accounts ?? 0);
            setEl('[data-stat="submissions"]', s.total_submissions ?? 0);

            // Recent accounts list (replaces audit log)
            const logContainer = document.getElementById('audit-list');
            if (logContainer) {
                try {
                    const accounts = await fetchAPI('/admin/accounts');
                    const recent = accounts.slice(0, 8);
                    if (!recent.length) {
                        logContainer.innerHTML = `<div class="py-6 text-center text-on-surface-variant text-sm">No accounts found.</div>`;
                    } else {
                        logContainer.innerHTML = recent.map(a => {
                            const statusCls = a.Status === 'Active' ? 'bg-success-emerald/10 text-success-emerald' : 'bg-error/10 text-error';
                            return `
                            <div class="flex items-center justify-between py-3">
                                <div class="flex items-center gap-3">
                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent((a.FirstName||'U')+' '+(a.LastName||''))}&background=0D9488&color=fff&bold=true&size=64"
                                         class="w-8 h-8 rounded-full" alt="${a.Username}"/>
                                    <div>
                                        <p class="font-label-md font-semibold text-on-surface">${a.FirstName} ${a.LastName||''}</p>
                                        <p class="font-label-sm text-on-surface-variant">${a.Username} · ${a.PersonType}</p>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusCls}">${a.Status}</span>
                            </div>`;
                        }).join('');
                    }
                } catch(e) { logContainer.innerHTML = `<div class="py-4 text-center text-on-surface-variant text-sm">${e.message}</div>`; }
            }
        } catch (e) { console.error('Superadmin dashboard error:', e); }

    } else if (activePage === 'accounts' || activePage === 'access') {
        try {
            const accounts = await fetchAPI('/admin/accounts');
            const roles    = await fetchAPI('/admin/roles');

            const tbody = document.querySelector('table tbody');
            if (tbody) {
                tbody.innerHTML = accounts.map(a => {
                    const statusCls = a.Status === 'Active'
                        ? 'bg-success-emerald/10 text-success-emerald'
                        : (a.Status === 'Suspended' ? 'bg-error/10 text-error' : 'bg-outline-variant/20 text-text-muted');
                    const actions = a.Username === 'superadmin'
                        ? `<span class="text-xs text-on-surface-variant italic">Protected</span>`
                        : `<div class="flex gap-1 justify-center flex-wrap">
                             <button class="px-2 py-1 text-xs rounded-lg bg-warning-amber/10 text-warning-amber font-bold toggle-status-btn" data-id="${a.PersonID}" data-current="${a.Status}">
                               ${a.Status === 'Active' ? 'Suspend' : 'Activate'}
                             </button>
                             <button class="px-2 py-1 text-xs rounded-lg bg-secondary-container/20 text-secondary font-bold reset-pw-btn" data-id="${a.PersonID}">Reset PW</button>
                             <button class="px-2 py-1 text-xs rounded-lg bg-error/10 text-error font-bold delete-acc-btn" data-id="${a.PersonID}">Delete</button>
                           </div>`;
                    return `
                        <tr class="hover:bg-surface-container-low transition-colors">
                            <td class="px-4 py-3 font-bold text-primary">${a.Username}</td>
                            <td class="px-4 py-3">${a.FirstName} ${a.LastName || ''}</td>
                            <td class="px-4 py-3 text-text-muted text-sm">${a.Email}</td>
                            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusCls}">${a.Status}</span></td>
                            <td class="px-4 py-3 text-sm">${a.Roles || '-'}</td>
                            <td class="px-4 py-3 text-sm text-text-muted">${a.PersonType}</td>
                            <td class="px-4 py-3 text-center">${actions}</td>
                        </tr>
                    `;
                }).join('');

                // Bind actions
                document.querySelectorAll('.toggle-status-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const newStatus = btn.dataset.current === 'Active' ? 'Suspended' : 'Active';
                        if (!confirm(`${newStatus === 'Suspended' ? 'Suspend' : 'Activate'} this account?`)) return;
                        try {
                            await fetchAPI(`/admin/accounts/${btn.dataset.id}/status`, { method: 'PATCH', body: { status: newStatus } });
                            alert(`Account ${newStatus.toLowerCase()} successfully`);
                            window.location.reload();
                        } catch (e) { alert(e.message); }
                    };
                });

                document.querySelectorAll('.reset-pw-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const newPw = prompt('Enter new password (min 6 chars):');
                        if (!newPw || newPw.length < 6) return;
                        try {
                            await fetchAPI(`/admin/accounts/${btn.dataset.id}/reset-password`, { method: 'PATCH', body: { newPassword: newPw } });
                            alert('Password reset successfully');
                        } catch (e) { alert(e.message); }
                    };
                });

                document.querySelectorAll('.delete-acc-btn').forEach(btn => {
                    btn.onclick = async () => {
                        if (!confirm('Permanently delete this account and all associated data? This cannot be undone.')) return;
                        try {
                            await fetchAPI(`/admin/accounts/${btn.dataset.id}`, { method: 'DELETE' });
                            alert('Account deleted');
                            window.location.reload();
                        } catch (e) { alert(e.message); }
                    };
                });
            }

            // Add Account button
            const addBtn = document.getElementById('add-account-btn');
            if (addBtn) {
                addBtn.onclick = () => {
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                    modal.innerHTML = `
                        <div class="bg-surface-white p-6 rounded-2xl w-full max-w-lg shadow-2xl space-y-4 text-left max-h-screen overflow-y-auto">
                            <h3 class="font-headline-sm text-primary border-b pb-2">Create New User Account</h3>
                            <form id="create-acc-form" class="space-y-3">
                                <div class="grid grid-cols-2 gap-2">
                                    <div><label class="block text-xs font-bold mb-1">First Name *</label><input type="text" name="firstName" class="w-full text-sm rounded-lg border border-outline-variant p-2" required/></div>
                                    <div><label class="block text-xs font-bold mb-1">Last Name</label><input type="text" name="lastName" class="w-full text-sm rounded-lg border border-outline-variant p-2"/></div>
                                </div>
                                <div><label class="block text-xs font-bold mb-1">Email * <span class="text-text-muted font-normal">(permanent – cannot be changed)</span></label><input type="email" name="email" class="w-full text-sm rounded-lg border border-outline-variant p-2" required/></div>
                                <div><label class="block text-xs font-bold mb-1">CNIC *</label><input type="text" name="cnic" class="w-full text-sm rounded-lg border border-outline-variant p-2" placeholder="35201-1234567-1" required/></div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div><label class="block text-xs font-bold mb-1">Gender</label><select name="gender" class="w-full text-sm rounded-lg border border-outline-variant p-2"><option>Male</option><option>Female</option><option>Other</option></select></div>
                                    <div><label class="block text-xs font-bold mb-1">Date of Birth</label><input type="date" name="dob" class="w-full text-sm rounded-lg border border-outline-variant p-2"/></div>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="block text-xs font-bold mb-1">Person Type *</label>
                                        <select name="personType" class="w-full text-sm rounded-lg border border-outline-variant p-2" required>
                                            <option>Student</option><option>Faculty</option><option>Evaluator</option><option>Coordinator</option><option>Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold mb-1">Role *</label>
                                        <select name="roleId" class="w-full text-sm rounded-lg border border-outline-variant p-2" required>
                                            ${roles.map(r => `<option value="${r.RoleID}">${r.RoleName}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div><label class="block text-xs font-bold mb-1">Username * <span class="text-text-muted font-normal">(permanent – assigned by system)</span></label><input type="text" name="username" class="w-full text-sm rounded-lg border border-outline-variant p-2" required/></div>
                                <div><label class="block text-xs font-bold mb-1">Password * (min 6 chars)</label><input type="password" name="password" class="w-full text-sm rounded-lg border border-outline-variant p-2" required minlength="6"/></div>
                                <div class="flex gap-2 justify-end pt-4">
                                    <button type="button" class="px-4 py-2 border rounded-xl text-sm" id="close-acc-modal">Cancel</button>
                                    <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm">Create Account</button>
                                </div>
                            </form>
                        </div>`;
                    document.body.appendChild(modal);
                    modal.querySelector('#close-acc-modal').onclick = () => modal.remove();
                    modal.querySelector('form').onsubmit = async (e) => {
                        e.preventDefault();
                        const body = Object.fromEntries(new FormData(e.target).entries());
                        try {
                            await fetchAPI('/admin/accounts', { method: 'POST', body });
                            alert('Account created successfully!');
                            modal.remove();
                            window.location.reload();
                        } catch (err) { alert(err.message); }
                    };
                };
            }
        } catch (e) { console.error('Superadmin accounts error:', e); }

    }

    // Profile handled by bootstrapProfilePage() in page-templates.js
    if (activePage === 'profile' && typeof bootstrapProfilePage === 'function') {
        await bootstrapProfilePage();
    }
}

// ============================================================
// SHARED PROFILE PAGE (all roles)
// ============================================================
async function loadProfilePage(fetchAPI) {
    try {
        const profile = await fetchAPI('/profile/me');

        // Populate read-only fields
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '-'; };

        // Permanent/org-provided fields (shown, not editable)
        setText('profile-email',    profile.email);
        setText('profile-username', profile.username);
        setText('profile-cnic',     profile.cnic);
        setText('profile-reg-no',   profile.RegistrationNo || profile.EmployeeNo || '-');
        setText('profile-dept',     profile.DepartmentName || '-');
        setText('profile-batch',    profile.BatchName || '-');
        setText('profile-status',   profile.accountStatus);
        setText('profile-joined',   profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-');
        setText('profile-lastlogin',profile.lastLogin  ? new Date(profile.lastLogin).toLocaleString()    : 'Never');

        // Avatar
        const avatarEl = document.getElementById('profile-avatar');
        if (avatarEl) avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((profile.firstName||'') + ' ' + (profile.lastName||''))}&background=0D9488&color=fff&bold=true&size=128`;

        // Editable fields
        setVal('edit-firstname', profile.firstName);
        setVal('edit-lastname',  profile.lastName);
        setVal('edit-gender',    profile.gender);
        setVal('edit-dob',       profile.dob ? profile.dob.substring(0, 10) : '');

        // Full name display
        setText('profile-fullname', `${profile.firstName} ${profile.lastName || ''}`.trim());
        setText('profile-role',     profile.personType);

        // Bind save profile form
        const profileForm = document.getElementById('edit-profile-form');
        if (profileForm) {
            profileForm.onsubmit = async (e) => {
                e.preventDefault();
                const body = {
                    firstName: document.getElementById('edit-firstname').value,
                    lastName:  document.getElementById('edit-lastname').value,
                    gender:    document.getElementById('edit-gender').value,
                    dob:       document.getElementById('edit-dob').value
                };
                try {
                    await fetchAPI('/profile/me', { method: 'PUT', body });
                    alert('Profile updated successfully!');
                    window.location.reload();
                } catch (err) { alert(err.message); }
            };
        }

        // Bind change password form
        const pwForm = document.getElementById('change-password-form');
        if (pwForm) {
            pwForm.onsubmit = async (e) => {
                e.preventDefault();
                const currentPassword = document.getElementById('current-password').value;
                const newPassword     = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                if (newPassword !== confirmPassword) {
                    alert('New passwords do not match');
                    return;
                }
                if (newPassword.length < 6) {
                    alert('New password must be at least 6 characters');
                    return;
                }

                try {
                    await fetchAPI('/profile/me/password', { method: 'PATCH', body: { currentPassword, newPassword } });
                    alert('Password changed successfully! Please log in again.');
                    logout();
                } catch (err) { alert(err.message); }
            };
        }
    } catch (e) {
        console.error('Profile load error:', e);
    }
}
