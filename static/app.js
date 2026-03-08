/* 全局工具：认证、API 调用、渲染 */
(function () {
  const STORAGE_KEY = "careeraid_token";

  function getToken() {
    return localStorage.getItem(STORAGE_KEY) || "";
  }

  function setToken(token) {
    if (token) localStorage.setItem(STORAGE_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function requireAuth() {
    const token = getToken();
    if (!token) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  async function apiFetch(path, options = {}) {
    const headers = Object.assign({}, options.headers || {});
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
    const opts = Object.assign({}, options, { headers });
    const res = await fetch(path, opts);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { ok: res.ok, raw: text };
    }
    if (!res.ok) {
      const msg = (data && data.error) ? data.error : ("请求失败：" + res.status);
      throw new Error(msg);
    }
    return data;
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function scoreClass(score) {
    const n = Number(score || 0);
    if (n >= 75) return "good";
    if (n >= 55) return "mid";
    return "bad";
  }

  function mountTopbar(active) {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;
    const nav = topbar.querySelector(".nav");
    if (!nav) return;
    const token = getToken();
    const authed = Boolean(token);

    // 比赛/验收版：核心导航 4 个按钮
    const links = [
      { href: "upload.html", text: "简历上传", id: "upload" },
      { href: "test.html", text: "性格测评", id: "test" },
      { href: "job.html", text: "岗位列表", id: "job" },
      { href: "report.html", text: "报告生成", id: "report" },
    ];

    nav.innerHTML = "";
    if (authed) {
      // chat 作为核心页入口
      const chat = document.createElement("a");
      chat.href = "chat.html";
      chat.className = "btn" + (active === "chat" ? " primary" : "");
      chat.textContent = "Agent对话";
      nav.appendChild(chat);

      for (const l of links) {
        const a = document.createElement("a");
        a.href = l.href;
        a.className = "btn" + (active === l.id ? " primary" : "");
        a.textContent = l.text;
        nav.appendChild(a);
      }
      const logout = document.createElement("button");
      logout.className = "btn danger";
      logout.textContent = "退出登录";
      logout.addEventListener("click", () => {
        clearToken();
        window.location.href = "index.html";
      });
      nav.appendChild(logout);
    } else {
      const login = document.createElement("a");
      login.href = "login.html";
      login.className = "btn primary";
      login.textContent = "立即登录";
      nav.appendChild(login);
    }
  }

  window.CareerAid = {
    getToken,
    setToken,
    clearToken,
    requireAuth,
    apiFetch,
    qs,
    escapeHtml,
    scoreClass,
    mountTopbar,
  };
})();

