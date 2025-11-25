import contentConfig from '@/config/content.json';

export function useContent<T = typeof contentConfig>(
    path?: string
): T {
    if (!path) return contentConfig as T;

    const keys = path.split('.');
    let result: any = contentConfig;

    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return undefined as T;
        }
    }

    return result as T;
}

export function useAuthContent() {
    return contentConfig.auth;
}

export function useNavigationContent() {
    return contentConfig.navigation;
}

export function useCommonContent() {
    return contentConfig.common;
}

export function useErrorMessages() {
    return contentConfig.errors;
}
