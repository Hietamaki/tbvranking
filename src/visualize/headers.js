exports.GetHeaders = function (title="", player_page = false) {


  const imports = player_page?
   `<link rel='stylesheet' href='../style.css'>
    <script src='../client.js'></script>
    <script src='../Chart.bundle.min.js'></script>
    <script src='../utils.js'></script>`
  : 
   `<link rel='stylesheet' href='style.css'>
    <script src='client.js'></script>`;

  return `<!DOCTYPE html>
  <head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>${title} - TBV tulospalvelu</title>
    ${imports}
    <!-- Matomo -->
    <script type="text/javascript">
      var _paq = _paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="//sake.kapsi.fi/anal/";
        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', '2']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
      })();
    </script>
    <!-- End Matomo Code -->
  </head>`;
}