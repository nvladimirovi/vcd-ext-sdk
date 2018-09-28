export abstract class XMLHelper {
    public static xmlToJson<T>(xml: any): T {
        // Create the return object
        let obj: T = <T>{};

        if (xml.nodeType === 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
            obj = <T>{};
                for (let j = 0; j < xml.attributes.length; j++) {
                    const attribute = xml.attributes.item(j);

                    try {
                        obj[attribute.nodeName] = JSON.parse(attribute.nodeValue);
                    } catch (err) {
                        obj[attribute.nodeName] = attribute.nodeValue;
                    }
                }
            }
        } else if (xml.nodeType === 3) { // text
            try {
                obj = JSON.parse(xml.nodeValue);
            } catch (err) {
                obj = xml.nodeValue;
            }
        }

        // do children
        if (xml.hasChildNodes()) {
            for (let i = 0; i < xml.childNodes.length; i++) {
                const item = xml.childNodes.item(i);
                const nodeName = item.nodeName;
                if (typeof(obj[nodeName]) === "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) === "undefined") {
                        const old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    };
}
