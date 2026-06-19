class CoverflowCarousel extends HTMLElement {
  constructor() {
    super();
    this.items = Array.from(this.querySelectorAll('.coverflow-item'));
    this.currentIndex = Math.floor(this.items.length / 2); // Start in the middle
    
    // Drag state
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;
    
    this.bindEvents();
    this.update();
  }

  bindEvents() {
    this.items.forEach((item, index) => {
      item.addEventListener('click', () => {
        if (!this.isDragging) {
          this.currentIndex = index;
          this.update();
        }
      });
    });

    // Touch events
    this.addEventListener('touchstart', this.touchStart.bind(this), { passive: true });
    this.addEventListener('touchmove', this.touchMove.bind(this), { passive: true });
    this.addEventListener('touchend', this.touchEnd.bind(this));

    // Mouse events for dragging
    this.addEventListener('mousedown', this.touchStart.bind(this));
    this.addEventListener('mousemove', this.touchMove.bind(this));
    this.addEventListener('mouseup', this.touchEnd.bind(this));
    this.addEventListener('mouseleave', () => {
      if (this.isDragging) this.touchEnd();
    });
  }

  touchStart(event) {
    this.isDragging = true;
    this.startX = this.getPositionX(event);
    this.animationID = requestAnimationFrame(this.animation.bind(this));
    this.classList.add('grabbing');
  }

  touchMove(event) {
    if (this.isDragging) {
      const currentPosition = this.getPositionX(event);
      this.currentTranslate = this.prevTranslate + currentPosition - this.startX;
    }
  }

  touchEnd() {
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);
    this.classList.remove('grabbing');
    
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    // Threshold to trigger slide change
    if (movedBy < -50 && this.currentIndex < this.items.length - 1) {
      this.currentIndex += 1;
    } else if (movedBy > 50 && this.currentIndex > 0) {
      this.currentIndex -= 1;
    }
    
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.update();
  }

  getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  animation() {
    // Optional: visual feedback during drag can be implemented here
    if (this.isDragging) {
      requestAnimationFrame(this.animation.bind(this));
    }
  }

  update() {
    this.items.forEach((item, i) => {
      // Calculate offset from center
      const offset = i - this.currentIndex;
      const absOffset = Math.abs(offset);
      
      // Calculate transform values
      // Center item has 0 offset
      const translateZ = absOffset === 0 ? 0 : -150 * absOffset;
      const translateX = offset * 200; // Spread out items horizontally
      const rotateY = offset === 0 ? 0 : offset > 0 ? -45 : 45; // Subtle rotation
      
      // Calculate opacity
      const opacity = absOffset === 0 ? 1 : Math.max(0.3, 1 - (absOffset * 0.3));
      
      // Z-index calculation (center highest, edges lower)
      const zIndex = 100 - absOffset;
      
      item.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
      item.style.opacity = opacity;
      item.style.zIndex = zIndex;
      item.style.filter = absOffset === 0 ? 'none' : 'grayscale(30%) blur(2px)';
      
      if (absOffset === 0) {
        item.setAttribute('data-status', 'active');
      } else {
        item.setAttribute('data-status', 'inactive');
      }
    });
  }
}

customElements.define('coverflow-carousel', CoverflowCarousel);
