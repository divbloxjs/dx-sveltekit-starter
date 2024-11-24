<script>
    import ProfileIconLight from "$lib/assets/images/profile-icon.svg";
    import ProfileIconDark from "$lib/assets/images/profile-icon-white.svg";
    import { isLightMode } from "$lib/helpers";
</script>

<img src={isLightMode() ? ProfileIconLight : ProfileIconDark} alt="Profile" class="h-full" />