
import querystring from 'querystring';

function isLocalStorageSupported() {
    let testKey = 'test', storage = window.localStorage;
    try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    }
    catch (error) {
        return false;
    }
}

const canUseLocalStorage = isLocalStorageSupported();

class WebSessionCounter {
    constructor() {
        this.update();
    }

    get count() {
        if (canUseLocalStorage) {
            return Number(window.localStorage.getItem('hypofriend_user_web_session_count'));
        }else{
            return NaN;
        }
    }

    set count(val) {
        window.localStorage.setItem('hypofriend_user_web_session_count', val);
    }

    get lastActive() {
        const time = window.localStorage.getItem('hypofriend_user_web_session_last_active');

        if (time) {
            return new Date(time);
        }else{
            return new Date();
        }
    }

    set lastActive(time) {
        window.localStorage.setItem('hypofriend_user_web_session_last_active', time.toISOString());
    }

    get lastUtmCampaign() {
        return window.localStorage.getItem('hypofriend_user_web_session_utm_campaign');
    }

    set lastUtmCampaign(val) {
        window.localStorage.setItem('hypofriend_user_web_session_utm_campaign', val);
    }

    get currentUtmCampaign() {
        const [ path, query = '' ] = window.location.href.split('?'),
              { utm_campaign = '' } = querystring.parse(query);

        return utm_campaign;
    }

    get lastUtmSource() {
        return window.localStorage.getItem('hypofriend_user_web_session_utm_source');
    }

    set lastUtmSource(val) {
        window.localStorage.setItem('hypofriend_user_web_session_utm_source', val);
    }

    get currentUtmSource() {
        const [ path, query = '' ] = window.location.href.split('?'),
              { utm_source = '' } = querystring.parse(query);

        return utm_source;
    }

    get lastUtmMedium() {
        return window.localStorage.getItem('hypofriend_user_web_session_utm_medium');
    }

    set lastUtmMedium(val) {
        window.localStorage.setItem('hypofriend_user_web_session_utm_medium', val);
    }

    get currentUtmMedium() {
        const [ path, query = '' ] = window.location.href.split('?'),
              { utm_medium = '' } = querystring.parse(query);

        return utm_medium;
    }

    update() {
        if (canUseLocalStorage) {
            let count = this.count,
                time = this.lastActive;

            if (count === 0 || this.isNewSession()) {
                this.count = count + 1;
                this.lastActive = new Date();
                this.lastUtmCampaign = this.currentUtmCampaign;
                this.lastUtmMedium = this.currentUtmMedium;
                this.lastUtmSource = this.currentUtmSource;
            }
        }
    }

    isNewSession() {
        // use definition from https://support.google.com/analytics/answer/2731565?hl=en

        const time = this.lastActive,
              now = new Date();

        return [
            (now - time)/1000/60 > 30,
            now.toDateString() !== time.toDateString(),
            this.lastUtmCampaign !== this.currentUtmCampaign,
            this.lastUtmSource !== this.currentUtmMedium,
            this.lastUtmMedium !== this.currentUtmSource
        ].some(b => b);
    }
}

export default new WebSessionCounter();
