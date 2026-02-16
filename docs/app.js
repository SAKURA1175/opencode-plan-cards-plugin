(() => {
  const links = window.SITE_LINKS
  const content = window.SITE_CONTENT
  const supportedLangs = window.SUPPORTED_LANGS ?? ["zh", "en", "ja"]
  const defaultLang = window.DEFAULT_LANG ?? "zh"
  const storageKey = window.LANGUAGE_STORAGE_KEY ?? "opencode-plan-cards-lang"

  if (!links || !content) return

  const $ = (id) => document.getElementById(id)

  const state = {
    lang: defaultLang,
  }

  function normalizeLang(raw) {
    if (!raw) return null
    const lower = String(raw).trim().toLowerCase()
    if (supportedLangs.includes(lower)) return lower
    if (lower.startsWith("zh")) return "zh"
    if (lower.startsWith("ja")) return "ja"
    if (lower.startsWith("en")) return "en"
    return null
  }

  function getQueryLang() {
    try {
      return normalizeLang(new URLSearchParams(window.location.search).get("lang"))
    } catch {
      return null
    }
  }

  function getStoredLang() {
    try {
      return normalizeLang(window.localStorage.getItem(storageKey))
    } catch {
      return null
    }
  }

  function detectBrowserLang() {
    const normalized = normalizeLang(window.navigator.language)
    if (normalized) return normalized
    const first = window.navigator.languages?.[0]
    const fromList = normalizeLang(first)
    return fromList || null
  }

  function resolveInitialLang() {
    const fromQuery = getQueryLang()
    if (fromQuery) return fromQuery

    const fromStorage = getStoredLang()
    if (fromStorage) return fromStorage

    const fromBrowser = detectBrowserLang()
    if (fromBrowser) return fromBrowser

    return defaultLang
  }

  function setMeta(name, value) {
    let node = document.querySelector(`meta[name="${name}"]`)
    if (!node) {
      node = document.createElement("meta")
      node.setAttribute("name", name)
      document.head.appendChild(node)
    }
    node.setAttribute("content", value)
  }

  function setMetaProperty(property, value) {
    let node = document.querySelector(`meta[property="${property}"]`)
    if (!node) {
      node = document.createElement("meta")
      node.setAttribute("property", property)
      document.head.appendChild(node)
    }
    node.setAttribute("content", value)
  }

  function writeLangToUrl(lang) {
    const url = new URL(window.location.href)
    url.searchParams.set("lang", lang)
    window.history.replaceState(null, "", url.toString())
  }

  function rememberLang(lang) {
    try {
      window.localStorage.setItem(storageKey, lang)
    } catch {}
  }

  function createCodeCard({ label, code }, ui) {
    const card = document.createElement("div")
    card.className = "code-card"

    const head = document.createElement("div")
    head.className = "code-card-head"

    const title = document.createElement("strong")
    title.textContent = label
    head.appendChild(title)

    const copy = document.createElement("button")
    copy.type = "button"
    copy.className = "copy-btn"
    copy.setAttribute("data-copy", code)
    copy.setAttribute("data-label", ui.copy)
    copy.setAttribute("data-copied", ui.copied)
    copy.textContent = ui.copy
    head.appendChild(copy)

    card.appendChild(head)

    const pre = document.createElement("pre")
    const codeNode = document.createElement("code")
    codeNode.textContent = code
    pre.appendChild(codeNode)
    card.appendChild(pre)

    return card
  }

  function renderWhySection(t) {
    $("why-title").textContent = t.why.title
    const grid = $("why-grid")
    grid.replaceChildren()

    t.why.items.forEach((item) => {
      const article = document.createElement("article")
      article.className = "feature-card hero-panel"

      const h3 = document.createElement("h3")
      h3.textContent = item.title
      article.appendChild(h3)

      const p = document.createElement("p")
      p.textContent = item.description
      article.appendChild(p)

      grid.appendChild(article)
    })
  }

  function renderQuickstartSection(t) {
    $("quickstart-title").textContent = t.quickstart.title
    $("quickstart-subtitle").textContent = t.quickstart.subtitle
    $("quick-steps-title").textContent = t.quickstart.stepsTitle
    $("quick-commands-title").textContent = t.quickstart.commandsTitle
    $("quick-check-title").textContent = t.quickstart.checklistTitle

    const steps = $("quick-steps")
    steps.replaceChildren()
    t.quickstart.steps.forEach((value) => {
      const li = document.createElement("li")
      li.textContent = value
      steps.appendChild(li)
    })

    const commands = $("quick-commands")
    commands.replaceChildren()
    t.quickstart.commands.forEach((item) => {
      commands.appendChild(createCodeCard(item, t.ui))
    })

    const checklist = $("quick-checklist")
    checklist.replaceChildren()
    t.quickstart.checklist.forEach((value) => {
      const li = document.createElement("li")
      li.textContent = value
      checklist.appendChild(li)
    })
  }

  function renderManualSection(t) {
    $("manual-title").textContent = t.manual.title
    $("manual-subtitle").textContent = t.manual.subtitle
    const container = $("manual-content")
    container.replaceChildren()

    t.manual.sections.forEach((section) => {
      const card = document.createElement("article")
      card.className = "manual-card"

      const h3 = document.createElement("h3")
      h3.textContent = section.title
      card.appendChild(h3)

      if (section.description) {
        const p = document.createElement("p")
        p.textContent = section.description
        card.appendChild(p)
      }

      if (section.bullets?.length) {
        const ul = document.createElement("ul")
        ul.className = "bullet-list"
        section.bullets.forEach((value) => {
          const li = document.createElement("li")
          li.textContent = value
          ul.appendChild(li)
        })
        card.appendChild(ul)
      }

      if (section.codeBlocks?.length) {
        const list = document.createElement("div")
        list.className = "code-list"
        section.codeBlocks.forEach((item) => {
          list.appendChild(createCodeCard(item, t.ui))
        })
        card.appendChild(list)
      }

      container.appendChild(card)
    })
  }

  function renderCommandTable(t) {
    $("commands-title").textContent = t.commandTable.title
    $("commands-subtitle").textContent = t.commandTable.subtitle
    $("commands-head-command").textContent = t.commandTable.head.command
    $("commands-head-desc").textContent = t.commandTable.head.desc
    $("commands-head-action").textContent = t.commandTable.head.action

    const body = $("commands-body")
    body.replaceChildren()

    t.commandTable.rows.forEach((row) => {
      const tr = document.createElement("tr")

      const commandTd = document.createElement("td")
      const commandCode = document.createElement("code")
      commandCode.textContent = row.command
      commandTd.appendChild(commandCode)
      tr.appendChild(commandTd)

      const descTd = document.createElement("td")
      descTd.textContent = row.desc
      tr.appendChild(descTd)

      const actionTd = document.createElement("td")
      const copy = document.createElement("button")
      copy.type = "button"
      copy.className = "copy-btn"
      copy.setAttribute("data-copy", row.command)
      copy.setAttribute("data-label", t.ui.copy)
      copy.setAttribute("data-copied", t.ui.copied)
      copy.textContent = t.ui.copy
      actionTd.appendChild(copy)
      tr.appendChild(actionTd)

      body.appendChild(tr)
    })
  }

  function renderFaq(t) {
    $("faq-title").textContent = t.faq.title
    const list = $("faq-list")
    list.replaceChildren()

    t.faq.items.forEach((item) => {
      const details = document.createElement("details")
      details.className = "faq-item"

      const summary = document.createElement("summary")
      summary.textContent = item.q
      details.appendChild(summary)

      const p = document.createElement("p")
      p.textContent = item.a
      details.appendChild(p)

      list.appendChild(details)
    })
  }

  function renderHeroAndHeader(t) {
    const brandText = document.querySelector("#brand-name .brand-text")
    if (brandText) {
      brandText.textContent = t.brand
    }
    $("nav-why").textContent = t.nav.why
    $("nav-quickstart").textContent = t.nav.quickstart
    $("nav-manual").textContent = t.nav.manual
    $("nav-commands").textContent = t.nav.commands
    $("nav-faq").textContent = t.nav.faq

    $("header-star-link").textContent = t.header.star
    $("header-follow-link").textContent = t.header.follow

    $("hero-eyebrow").textContent = t.hero.eyebrow
    $("hero-title").textContent = t.hero.title
    $("hero-subtitle").textContent = t.hero.subtitle
    $("demo-caption").textContent = t.hero.demoCaption ?? ""
    $("hero-install-link").textContent = t.hero.install
    $("hero-manual-link").textContent = t.hero.manual

    $("badge-title").textContent = t.badgeTitle
    const badgeList = $("badge-list")
    badgeList.replaceChildren()
    t.badgeItems.forEach((item) => {
      const anchor = document.createElement("a")
      anchor.href = item.href
      anchor.target = "_blank"
      anchor.rel = "noreferrer noopener"

      const image = document.createElement("img")
      image.src = item.image
      image.alt = item.label
      image.loading = "lazy"
      anchor.appendChild(image)

      badgeList.appendChild(anchor)
    })

    $("header-star-link").href = links.repo
    $("header-follow-link").href = links.follow
  }

  function renderBottomAndFooter(t) {
    $("bottom-title").textContent = t.bottom.title
    $("bottom-subtitle").textContent = t.bottom.subtitle
    $("bottom-star-link").textContent = t.bottom.star
    $("bottom-follow-link").textContent = t.bottom.follow
    $("bottom-npm-link").textContent = t.bottom.npm

    $("bottom-star-link").href = links.repo
    $("bottom-follow-link").href = links.follow
    $("bottom-npm-link").href = links.npm

    $("footer-note").textContent = t.footer.note
    $("footer-repo-link").textContent = t.footer.repo
    $("footer-issues-link").textContent = t.footer.issues
    $("footer-license-link").textContent = t.footer.license
    $("footer-repo-link").href = links.repo
    $("footer-issues-link").href = links.issues
    $("footer-license-link").href = links.license
    $("footer-npm-link").href = links.npm
  }

  function applyMeta(t, lang) {
    document.documentElement.setAttribute("lang", lang)
    document.title = t.meta.title
    setMeta("description", t.meta.description)
    setMetaProperty("og:title", t.meta.title)
    setMetaProperty("og:description", t.meta.description)
  }

  function applyLangButtonState(lang) {
    document.querySelectorAll("[data-lang-btn]").forEach((node) => {
      const active = node.getAttribute("data-lang-btn") === lang
      node.classList.toggle("active", active)
      node.setAttribute("aria-pressed", String(active))
    })
  }

  function render(lang) {
    const t = content[lang] ?? content[defaultLang]
    if (!t) return
    state.lang = lang

    applyMeta(t, lang)
    applyLangButtonState(lang)
    renderHeroAndHeader(t)
    renderWhySection(t)
    renderQuickstartSection(t)
    renderManualSection(t)
    renderCommandTable(t)
    renderFaq(t)
    renderBottomAndFooter(t)
  }

  async function copyText(text) {
    if (!text) return false
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const area = document.createElement("textarea")
      area.value = text
      area.setAttribute("readonly", "")
      area.style.position = "absolute"
      area.style.left = "-9999px"
      document.body.appendChild(area)
      area.select()
      const copied = document.execCommand("copy")
      document.body.removeChild(area)
      return copied
    }
  }

  document.addEventListener("click", async (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const langButton = target.closest("[data-lang-btn]")
    if (langButton) {
      const lang = normalizeLang(langButton.getAttribute("data-lang-btn"))
      if (!lang) return
      rememberLang(lang)
      writeLangToUrl(lang)
      render(lang)
      return
    }

    const copyButton = target.closest("[data-copy]")
    if (!copyButton) return

    const value = copyButton.getAttribute("data-copy")
    const ok = await copyText(value)
    if (!ok) return

    const copied = copyButton.getAttribute("data-copied") ?? "Copied"
    const label = copyButton.getAttribute("data-label") ?? "Copy"
    copyButton.textContent = copied
    window.setTimeout(() => {
      copyButton.textContent = label
    }, 1400)
  })

  const initialLang = resolveInitialLang()
  rememberLang(initialLang)
  writeLangToUrl(initialLang)
  render(initialLang)
})()
