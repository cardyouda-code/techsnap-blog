// ===== MOBILE MENU =====
const toggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (toggle && mobileNav) {
  toggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
}

// ===== LOAD ARTICLES FROM JSON (top page only) =====
async function loadArticles() {
  const grid = document.getElementById('article-grid');
  const rankList = document.getElementById('rank-list');
  const heroCard = document.getElementById('hero-card');
  if (!grid) return;

  try {
    const res = await fetch('articles.json');
    const articles = await res.json();

    // Hero: 最新記事
    if (heroCard && articles.length > 0) {
      const a = articles[0];
      heroCard.innerHTML = `
        <a href="${a.url}">
          <div class="hero-card-img">
            <img src="${a.image}" alt="${a.title}" loading="lazy">
          </div>
          <div class="hero-card-body">
            <div class="hero-card-meta">
              <span class="tag">${a.category}</span>
              <span class="date">${a.date}</span>
            </div>
            <h3><a href="${a.url}">${a.title}</a></h3>
            <p class="hero-score">総合スコア ${a.score} / 10</p>
          </div>
        </a>
      `;
    }

    // Article grid
    grid.innerHTML = '';
    articles.forEach(a => {
      const card = document.createElement('article');
      card.className = 'article-card';
      card.dataset.cat = a.category;
      card.innerHTML = `
        <div class="card-img">
          <img src="${a.image}" alt="${a.title}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="tag">${a.category}</span>
            <span class="date">${a.date}</span>
          </div>
          <h3><a href="${a.url}">${a.title}</a></h3>
          <p class="card-excerpt">${a.excerpt}</p>
          <p class="card-score">${a.score} / 10</p>
        </div>
      `;
      grid.appendChild(card);
    });

    // Ranking
    if (rankList) {
      const sorted = [...articles].sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
      rankList.innerHTML = sorted.map((a, i) => `
        <li class="rank-item">
          <span class="rank-num">${i + 1}</span>
          <div class="rank-body">
            <span class="tag sm">${a.category}</span>
            <a href="${a.url}">${a.title}</a>
          </div>
          <span class="rank-score">${a.score}</span>
        </li>
      `).join('');
    }

    // Category filter
    const catBtns = document.querySelectorAll('.cat-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        document.querySelectorAll('.article-card').forEach(card => {
          card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
        });
      });
    });

  } catch (e) {
    if (grid) grid.innerHTML = '<p style="color:#8c7b6a;font-size:0.9rem;">記事を読み込めませんでした。</p>';
  }
}

loadArticles();
