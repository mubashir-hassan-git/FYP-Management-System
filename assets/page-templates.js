// ============================================================
// Shared Profile Page Template
// Superadmin can edit personal info + change password
// All other roles can ONLY change password
// ============================================================

function renderProfilePage(role) {
    const isSuperAdmin = (role === 'superadmin');
    const main = document.querySelector('main');
    if (!main) return;

    const editSection = isSuperAdmin ? `
        <!-- Edit Profile Form — superadmin only -->
        <div class="bg-surface-white rounded-2xl custom-shadow border border-outline-variant/30 p-8">
            <h3 class="font-headline-sm text-primary mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined">edit</span> Edit Personal Information
            </h3>
            <div id="profile-save-msg" class="hidden mb-4 p-3 bg-success-emerald/10 text-success-emerald rounded-xl text-sm font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">check_circle</span> Profile updated successfully!
            </div>
            <form id="edit-profile-form" class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label-md font-bold mb-2">First Name *</label>
                        <input id="edit-firstname" type="text" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30" required/>
                    </div>
                    <div>
                        <label class="block font-label-md font-bold mb-2">Last Name</label>
                        <input id="edit-lastname" type="text" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30"/>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label-md font-bold mb-2">Gender</label>
                        <select id="edit-gender" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30">
                            <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-label-md font-bold mb-2">Date of Birth</label>
                        <input id="edit-dob" type="date" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30"/>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md font-bold hover:opacity-90 shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">save</span> Save Changes
                    </button>
                </div>
            </form>
        </div>` : `
        <!-- Read-only notice for non-superadmin -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <span class="material-symbols-outlined text-blue-500 mt-0.5">info</span>
            <div>
                <p class="font-label-md font-bold text-blue-800">Profile Information is Read-Only</p>
                <p class="font-body-sm text-blue-700">All personal information is managed by the institution. You can only change your password below.</p>
            </div>
        </div>`;

    main.innerHTML = `
    <div class="p-margin-desktop max-w-[900px] mx-auto space-y-gutter">
        <div>
            <h2 class="font-headline-lg text-headline-lg text-primary">My Profile</h2>
            <p class="font-body-md text-on-surface-variant mt-1">View your details and manage your password.</p>
        </div>

        <!-- Profile Card -->
        <div class="bg-surface-white rounded-2xl custom-shadow border border-outline-variant/30 overflow-hidden">
            <div class="h-24 login-gradient relative">
                <div class="absolute -bottom-10 left-8">
                    <img id="profile-avatar" src="https://ui-avatars.com/api/?name=User&background=0D9488&color=fff&bold=true&size=128"
                         alt="Profile" class="w-20 h-20 rounded-full border-4 border-surface-white shadow-lg object-cover"/>
                </div>
            </div>
            <div class="pt-14 px-8 pb-4">
                <h3 class="font-headline-sm text-primary font-bold" id="profile-fullname">—</h3>
                <p class="font-body-md text-on-surface-variant" id="profile-role">—</p>
            </div>
            <div class="px-8 pb-8 space-y-6">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <span class="material-symbols-outlined text-amber-600 mt-0.5">lock</span>
                    <div>
                        <p class="font-label-md font-bold text-amber-800">Organisation-Assigned Fields (Read-Only)</p>
                        <p class="font-body-sm text-amber-700">Email, username, CNIC and ID numbers are permanently assigned by the institution.</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-surface-container-low rounded-xl p-4">
                        <label class="block font-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">mail</span> Email</label>
                        <p class="font-body-md font-semibold text-on-surface" id="profile-email">—</p>
                    </div>
                    <div class="bg-surface-container-low rounded-xl p-4">
                        <label class="block font-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">alternate_email</span> Username</label>
                        <p class="font-body-md font-semibold text-on-surface" id="profile-username">—</p>
                    </div>
                    <div class="bg-surface-container-low rounded-xl p-4">
                        <label class="block font-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">badge</span> CNIC</label>
                        <p class="font-body-md font-semibold text-on-surface" id="profile-cnic">—</p>
                    </div>
                    <div class="bg-surface-container-low rounded-xl p-4">
                        <label class="block font-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">numbers</span> Reg / Employee No</label>
                        <p class="font-body-md font-semibold text-on-surface" id="profile-reg-no">—</p>
                    </div>
                    <div class="bg-surface-container-low rounded-xl p-4">
                        <label class="block font-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">domain</span> Department / Batch</label>
                        <p class="font-body-md font-semibold text-on-surface" id="profile-dept">—</p>
                    </div>
                    <div class="bg-surface-container-low rounded-xl p-4">
                        <label class="block font-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">verified_user</span> Account Status</label>
                        <p class="font-body-md font-semibold text-success-emerald" id="profile-status">—</p>
                        <p class="font-label-sm text-on-surface-variant mt-1">Joined: <span id="profile-joined">—</span></p>
                    </div>
                </div>
            </div>
        </div>

        ${editSection}

        <!-- Change Password -->
        <div class="bg-surface-white rounded-2xl custom-shadow border border-outline-variant/30 p-8">
            <h3 class="font-headline-sm text-primary mb-2 flex items-center gap-2"><span class="material-symbols-outlined">key</span> Change Password</h3>
            <p class="font-body-sm text-on-surface-variant mb-6">After changing your password you will be logged out automatically.</p>
            <div id="pw-error" class="hidden mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm"></div>
            <form id="change-password-form" class="space-y-5">
                <div>
                    <label class="block font-label-md font-bold mb-2">Current Password *</label>
                    <input id="current-password" type="password" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30" required/>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label-md font-bold mb-2">New Password * (min 6)</label>
                        <input id="new-password" type="password" minlength="6" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30" required/>
                    </div>
                    <div>
                        <label class="block font-label-md font-bold mb-2">Confirm New Password *</label>
                        <input id="confirm-password" type="password" minlength="6" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30" required/>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="bg-error text-on-error px-8 py-3 rounded-xl font-label-md font-bold hover:opacity-90 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">lock_reset</span> Change Password
                    </button>
                </div>
            </form>
        </div>
    </div>`;
}

async function bootstrapProfilePage() {
    const token = localStorage.getItem('namal_fyp_token');
    if (!token) return;
    const pathStr = window.location.pathname;
    const base = (pathStr.includes('/student/') || pathStr.includes('/faculty/') ||
                  pathStr.includes('/evaluator/') || pathStr.includes('/coordinator/') ||
                  pathStr.includes('/superadmin/')) ? '../' : '';

    const sess = JSON.parse(localStorage.getItem('namal_fyp_session') || '{}');
    const isSuperAdmin = sess.role === 'superadmin';

    const apiCall = async (url, opts = {}) => {
        const headers = { 'Authorization': `Bearer ${token}`, ...opts.headers };
        if (opts.body && !(opts.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(opts.body);
        }
        const r = await fetch(base + 'api' + url, { ...opts, headers });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.message || r.statusText);
        return data;
    };

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
    const setVal  = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    const selVal  = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };

    try {
        const p = await apiCall('/profile/me');
        const avEl = document.getElementById('profile-avatar');
        if (avEl) avEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((p.firstName||'U')+' '+(p.lastName||''))}&background=0D9488&color=fff&bold=true&size=128`;

        setText('profile-fullname', `${p.firstName||''} ${p.lastName||''}`.trim());
        setText('profile-role',     p.personType);
        setText('profile-email',    p.email);
        setText('profile-username', p.username);
        setText('profile-cnic',     p.cnic);
        setText('profile-reg-no',   p.RegistrationNo || p.EmployeeNo || '—');
        setText('profile-dept',     p.DepartmentName || p.BatchName || '—');
        setText('profile-status',   p.accountStatus);
        setText('profile-joined',   p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—');

        // Only superadmin gets edit form
        if (isSuperAdmin) {
            setVal('edit-firstname', p.firstName);
            setVal('edit-lastname',  p.lastName);
            selVal('edit-gender',    p.gender);
            setVal('edit-dob',       p.dob ? String(p.dob).substring(0, 10) : '');

            document.getElementById('edit-profile-form')?.addEventListener('submit', async e => {
                e.preventDefault();
                try {
                    await apiCall('/profile/me', {
                        method: 'PUT',
                        body: {
                            firstName: document.getElementById('edit-firstname').value.trim(),
                            lastName:  document.getElementById('edit-lastname').value.trim(),
                            gender:    document.getElementById('edit-gender').value,
                            dob:       document.getElementById('edit-dob').value || null
                        }
                    });
                    const msg = document.getElementById('profile-save-msg');
                    if (msg) { msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 3000); }
                } catch(err) { alert(err.message); }
            });
        }

        // Change password — all roles
        document.getElementById('change-password-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const cur  = document.getElementById('current-password').value;
            const nw   = document.getElementById('new-password').value;
            const conf = document.getElementById('confirm-password').value;
            const errEl = document.getElementById('pw-error');
            if (nw !== conf) { errEl.textContent = 'New passwords do not match.'; errEl.classList.remove('hidden'); return; }
            if (nw.length < 6) { errEl.textContent = 'Min 6 characters required.'; errEl.classList.remove('hidden'); return; }
            errEl.classList.add('hidden');
            try {
                await apiCall('/profile/me/password', { method: 'PATCH', body: { currentPassword: cur, newPassword: nw } });
                alert('Password changed. You will now be logged out.');
                localStorage.removeItem('namal_fyp_session');
                localStorage.removeItem('namal_fyp_token');
                window.location.href = base + 'index.html';
            } catch(err) { errEl.textContent = err.message; errEl.classList.remove('hidden'); }
        });
    } catch(e) {
        console.error('Profile bootstrap error:', e.message);
    }
}
