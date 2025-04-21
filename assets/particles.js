tsParticles.load("tsparticles", {
  background: {
    color: {
      value: "#000000"
    }
  },
  fpsLimit: 60,
  particles: {
    color: { value: ["#ff0000", "#ff7300", "#fffb00", "#48ff00", "#00ffd5", "#002bff", "#7a00ff", "#ff00aa"] },
    links: {
      enable: true,
      color: "#ffffff",
      distance: 150,
      opacity: 0.4,
      width: 1
    },
    move: { enable: true, speed: 2 },
    number: { value: 60 },
    size: { value: 3 },
    opacity: { value: 0.5 }
  }
});
