const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;


exports.DrawEventSelector = function (events_by_series, event = false) {
	let upperbox = document.createElement("div")
	upperbox.id = "upperbox"

	upperbox.innerHTML = "<span class='guide'>VALITSE KISATAPAHTUMA:</span><br>";

	for (page of Object.keys(events_by_series).sort().reverse())
		upperbox.appendChild(DrawSerieDropdown(events_by_series, page, event))
    
    return upperbox
}


function DrawSerieDropdown(events_by_series, type, event) {

    let menubox = document.createElement("div")
    let menubutton = document.createElement("button")
    let menu = document.createElement("div")

    menubox.classList.add("dropdown")
    menubutton.setAttribute("onclick", "openMenu('"+type+"')")
    menubutton.classList.add("dropbtn")

    if (event && event.tags.includes(type))
        menubutton.classList.add("dropbtnactive");

    menubutton.innerHTML = type
    menu.id = "dropdown-"+type
    menu.classList.add("dropdown-content")

    menubox.appendChild(menubutton);
    menubox.appendChild(menu)

    for (page of events_by_series[type]) {
        let link = document.createElement("a");
        link.href = page[0]+".html"

        if (event && event.id == page[0])
            link.id = "active"
        link.innerHTML = page[1]
        menu.appendChild(link)
    }

    return menubox
}
        