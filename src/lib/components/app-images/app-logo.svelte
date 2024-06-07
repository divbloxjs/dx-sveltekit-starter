<script>
    import AppLogoLightMode from "$lib/assets/images/app-logo.light.png";
    import AppLogoDarkMode from "$lib/assets/images/app-logo.dark.png";
    import { mode } from "mode-watcher";
    import { PUBLIC_APP_DISPLAY_NAME } from "$env/static/public";
</script>

<img src={$mode === "light" ? AppLogoLightMode : AppLogoDarkMode} alt={`${PUBLIC_APP_DISPLAY_NAME} Logo`} {...$$restProps} />
