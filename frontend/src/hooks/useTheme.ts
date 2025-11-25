import themeConfig from '@/config/theme.json';

export function useTheme() {
    return themeConfig;
}

export function useThemeColors() {
    return themeConfig.colors;
}

export function useSpacing() {
    return themeConfig.spacing;
}

export function useTypography() {
    return themeConfig.typography;
}

export function useBrand() {
    return themeConfig.brand;
}
