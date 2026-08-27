/* ============================================================
   RINGERWORKS
   Shared Site Navigation
   ============================================================ */

(function () {

    /*
        Find this script's own location.

        This lets the navigation work whether the page is:

        /index.html
        /about/index.html
        /contact/index.html
        /work/index.html

        It also makes local file testing more reliable because
        we don't have to hard-code ../ paths for every page.
    */

    const script =
        document.currentScript;

    const scriptUrl =
        new URL(script.src);

    /*
        navigation.js lives here:

        /assets/js/navigation.js

        Going up two directories gets us back to
        the root of the RingerWorks site.
    */

    const siteRoot =
        new URL("../../", scriptUrl);


    function siteUrl(path) {

        return new URL(
            path,
            siteRoot
        ).href;

    }



    /* --------------------------------------------------------
       DETERMINE CURRENT PAGE
       -------------------------------------------------------- */

    const currentPath =
        window.location.pathname
            .replace(/\\/g, "/")
            .toLowerCase();


    function isCurrent(section) {

        if (
            section === "home" &&
            (
                currentPath.endsWith("/ringerworks.website/") ||
                currentPath.endsWith("/ringerworks.website/index.html") ||
                currentPath === "/" ||
                currentPath.endsWith("/index.html") &&
                !currentPath.includes("/about/") &&
                !currentPath.includes("/contact/") &&
                !currentPath.includes("/work/")
            )
        ) {
            return true;
        }


        return currentPath.includes(
            "/" + section + "/"
        );

    }



    /* --------------------------------------------------------
       BUILD NAVIGATION
       -------------------------------------------------------- */

    const navItems = [

        {
            name: "Work",
            path: "work/index.html",
            section: "work"
        },

        {
            name: "About",
            path: "about/index.html",
            section: "about"
        },

        {
            name: "Contact",
            path: "contact/index.html",
            section: "contact"
        }

    ];


    const navHtml =
        navItems
            .map(item => {

                const current =
                    isCurrent(item.section);


                return `
                    <a href="${siteUrl(item.path)}"
                       ${current
                        ? 'class="nav-current" aria-current="page"'
                        : ""}>
                        ${item.name}
                    </a>
                `;

            })
            .join("");



    /* --------------------------------------------------------
       INSERT NAVIGATION
       -------------------------------------------------------- */

    const nav =
        document.getElementById(
            "main-navigation"
        );


    if (nav) {

        nav.innerHTML =
            navHtml;

    }

})();