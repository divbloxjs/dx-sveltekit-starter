<script>
    import AppIconLightMode from "$lib/assets/images/app-icon.light.png";
    import AppIconDarkMode from "$lib/assets/images/app-icon.dark.png";
    import { mode } from "mode-watcher";
    import { PUBLIC_APP_DISPLAY_NAME } from "$env/static/public";
</script>

<img src={$mode === "light" ? AppIconLightMode : AppIconDarkMode} alt={`${PUBLIC_APP_DISPLAY_NAME} Icon`} {...$$restProps} />
