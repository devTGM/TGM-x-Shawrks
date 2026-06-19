const LOCAL_STORAGE_WISHLIST_KEY = 'shawrks_wishlist';

class Wishlist {
  constructor() {
    this.init();
  }

  init() {
    this.wishlist = this.getWishlist();
    this.updateIcons();
    this.bindEvents();
    
    // If on wishlist page, render items
    if (document.getElementById('wishlist-grid')) {
      this.renderWishlistPage();
    }
  }

  getWishlist() {
    const list = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
    return list ? JSON.parse(list) : [];
  }

  saveWishlist() {
    localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, JSON.stringify(this.wishlist));
    this.updateIcons();
  }

  toggle(productHandle) {
    const index = this.wishlist.indexOf(productHandle);
    if (index === -1) {
      this.wishlist.push(productHandle);
    } else {
      this.wishlist.splice(index, 1);
    }
    this.saveWishlist();
  }

  updateIcons() {
    const buttons = document.querySelectorAll('.wishlist-toggle');
    buttons.forEach(btn => {
      const handle = btn.getAttribute('data-product-handle');
      if (this.wishlist.includes(handle)) {
        btn.classList.add('is-active');
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      } else {
        btn.classList.remove('is-active');
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      }
    });

    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      badge.textContent = this.wishlist.length;
      badge.style.display = this.wishlist.length > 0 ? 'flex' : 'none';
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.wishlist-toggle');
      if (toggleBtn) {
        e.preventDefault();
        const handle = toggleBtn.getAttribute('data-product-handle');
        if (handle) {
          this.toggle(handle);
        }
      }
    });
  }

  async renderWishlistPage() {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('wishlist-empty');
    
    if (this.wishlist.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    grid.innerHTML = '<div class="loading-spinner">Loading...</div>';

    try {
      const promises = this.wishlist.map(handle => 
        fetch(`/products/${handle}?view=card`).then(res => res.text())
      );
      const htmlArray = await Promise.all(promises);
      grid.innerHTML = htmlArray.join('');
      
      // We need to re-init icons for the newly loaded cards
      this.updateIcons();
    } catch (err) {
      grid.innerHTML = '<p>Error loading wishlist. Please try refreshing.</p>';
      console.error(err);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.shawrksWishlist = new Wishlist();
});
