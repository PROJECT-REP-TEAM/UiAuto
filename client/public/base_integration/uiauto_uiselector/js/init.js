try {
    const cover_frame_script = document.getElementById('cover_frame_script');
    console.log(cover_frame_script);
    if (!cover_frame_script) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = 'cover_frame_script';
        script.src = 'http://localhost:3000/uiauto/common/uiselector/static_assets/cover_frame.js';
        document.body.appendChild(script);
    }
} catch (e) {
    console.log(e);
}


