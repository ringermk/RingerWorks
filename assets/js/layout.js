/* ============================================================
   RINGERWORKS
   Shared Site Header + Footer
   ============================================================ */

(function () {

    /* --------------------------------------------------------
       FIND THE SITE ROOT
       --------------------------------------------------------

       layout.js lives at:

       /assets/js/layout.js

       Going up two folders gets us to the website root.

       This approach works both:

       - when deployed to RingerWorks.com
       - when opening the HTML files locally
    -------------------------------------------------------- */

    const script = document.currentScript;

    if (!script) {
        return;
    }

    const scriptUrl = new URL(script.src);

    const siteRoot = new URL("../../", scriptUrl);


    function siteUrl(path) {
        return new URL(path, siteRoot).href;
    }



    /* --------------------------------------------------------
       CURRENT PAGE
       -------------------------------------------------------- */

    const currentUrl =
        window.location.href
            .replace(/\\/g, "/")
            .toLowerCase();


    function isCurrent(section) {

        return currentUrl.includes(
            "/" + section.toLowerCase() + "/"
        );

    }



    /* --------------------------------------------------------
       NAVIGATION ITEMS

       Edit this ONE list whenever you want to change
       navigation across the entire website.
       -------------------------------------------------------- */

    const navigationItems = [

        {
            label: "Work",
            path: "work/index.html",
            section: "work"
        },

        {
            label: "About",
            path: "about/index.html",
            section: "about"
        },

        {
            label: "Contact",
            path: "contact/index.html",
            section: "contact"
        }

    ];



    /* --------------------------------------------------------
       BUILD MAIN NAVIGATION
       -------------------------------------------------------- */

    function buildNavigation() {

        return navigationItems
            .map(item => {

                const current =
                    isCurrent(item.section);


                return `
                    <a href="${siteUrl(item.path)}"
                       ${current
                        ? 'class="nav-current" aria-current="page"'
                        : ""}>
                        ${item.label}
                    </a>
                `;

            })
            .join("");

    }



    /* --------------------------------------------------------
       HEADER
       -------------------------------------------------------- */

    function buildHeader() {

        return `
            <header class="site-header">

                <div class="container header-inner">

                    <a href="${siteUrl("index.html")}"
                       class="brand"
                       aria-label="RingerWorks home">

                        <img src="${siteUrl("assets/images/branding/ringerworks-horizontal-compact-light.png")}"
     alt="RingerWorks"
     class="brand-logo">

                    </a>


                    <nav class="main-nav"
                         aria-label="Main navigation">

                        ${buildNavigation()}

                    </nav>

                </div>

            </header>
        `;

    }



    /* --------------------------------------------------------
       FOOTER
       -------------------------------------------------------- */

    function buildFooter() {

        const year =
            new Date().getFullYear();


        const footerNavigation =
            navigationItems
                .map(item => {

                    return `
                    <a href="${siteUrl(item.path)}">
                        ${item.label}
                    </a>
                `;

                })
                .join("");


        const privacyLink = `
        <a href="${siteUrl("privacy/index.html")}">
            Privacy
        </a>
    `;


        return `
        <footer class="site-footer">

                <div class="container footer-inner">

                    <div class="footer-brand">

    <a href="${siteUrl("index.html")}"
       aria-label="RingerWorks home">

        <img src="${siteUrl("assets/images/branding/ringerworks-horizontal-compact-light.png")}"
             alt="RingerWorks - Creative thinking. Robust solutions."
             class="footer-logo">

                 <p class="footer-tagline">
        Creative thinking. Robust solutions.
    </p>

    </a>

</div>


                    <nav class="footer-nav"
                         aria-label="Footer navigation">

                        ${footerNavigation}
                        ${privacyLink}

                    </nav>


                    <p class="copyright">
                        &copy; ${year} RingerWorks
                    </p>

                </div>

            </footer>
        `;

    }



    /* --------------------------------------------------------
       INSERT HEADER
       -------------------------------------------------------- */

    const headerTarget =
        document.getElementById("site-header");


    if (headerTarget) {

        headerTarget.innerHTML =
            buildHeader();

    }



    /* --------------------------------------------------------
       INSERT FOOTER
       -------------------------------------------------------- */

    const footerTarget =
        document.getElementById("site-footer");


    if (footerTarget) {

        footerTarget.innerHTML =
            buildFooter();

    }

})();