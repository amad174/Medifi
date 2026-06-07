/* Medifi — shared image paths (served from /assets via ui_kits/app). */
(function () {
  var base = "../../assets/";

  function asset(file) {
    return base + encodeURI(file);
  }

  window.MEDIFI_ASSETS = {
    cat: asset("medifi-cat.png"),
    brand: asset("medifi .png"),
    nhsTeam: asset("ChatGPT Image Jun 7, 2026, 11_35_10 AM.png"),
    doctorPortrait: asset("b7146b21-c224-4b5d-8053-dcf1b2a9e118.png"),
    doctorFriendly: asset("doctor 1.jpg"),
    logo: asset("medifi-logo.png"),
  };
})();
