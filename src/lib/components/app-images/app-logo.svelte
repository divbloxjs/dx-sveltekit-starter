<script>
    import AppLogoLightMode from "$lib/assets/images/app-logo.light.png";
    import AppLogoDarkMode from "$lib/assets/images/app-logo.dark.png";
    import { mode } from "mode-watcher";
    import { env } from "$env/dynamic/public";
</script>

<img src={$mode === "light" ? AppLogoLightMode : AppLogoDarkMode} alt={`${env.PUBLIC_APP_DISPLAY_NAME} Logo`} {...$$restProps} />
