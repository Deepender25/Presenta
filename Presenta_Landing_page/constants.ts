
export const ANIMATION_STYLES = `
  /* Hide Scrollbar Global Utilities */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @keyframes write {
    to { stroke-dashoffset: 0; }
  }

  @keyframes fillIn {
    to { fill-opacity: 1; }
  }

  @keyframes dropTail {
    0% {
      opacity: 1;
      stroke-dashoffset: 3500;
    }
    100% {
      opacity: 1;
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes fadeOut {
    to { opacity: 0; }
  }

  /* 
     Dynamic Camera Pan
     Uses -100vh to perfectly slide the full-screen intro out of view.
  */
  @keyframes panCameraUp {
    0% {
      margin-top: 0;
    }
    100% {
      margin-top: -100vh;
    }
  }
  
  @keyframes revealContent {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    to { opacity: 1; }
  }

  /* Continuous floating animation for Hero elements */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }

  /* Infinite scrolling ticker animation */
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;