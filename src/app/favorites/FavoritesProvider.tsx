import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type FavoriteProperty = {
    id: string;
    slug?: string | null;
    title: string;
    city: string;
    neighborhood?: string | null;
    state?: string | null;
    purpose?: string | null;
    type?: string | null;
    price?: number | null;
    rent?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    area_m2?: number | null;
    cover?: string | null;
};

type FavoritesContextValue = {
    favorites: FavoriteProperty[];
    toggleFavorite: (property: FavoriteProperty) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue>({
    favorites: [],
    toggleFavorite: () => {},
    removeFavorite: () => {},
    isFavorite: () => false,
});

const STORAGE_KEY = "77imoveis:favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as FavoriteProperty[];
                setFavorites(parsed);
            }
        } catch (error) {
            console.error("Erro ao carregar favoritos:", error);
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error("Erro ao salvar favoritos:", error);
        }
    }, [favorites]);

    const toggleFavorite = useCallback((property: FavoriteProperty) => {
        setFavorites((prev) => {
            const exists = prev.some((fav) => fav.id === property.id);
            if (exists) {
                return prev.filter((fav) => fav.id !== property.id);
            }
            const sanitized: FavoriteProperty = {
                ...property,
                slug: property.slug ?? property.id,
            };
            return [...prev, sanitized];
        });
    }, []);

    const removeFavorite = useCallback((id: string) => {
        setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    }, []);

    const value = useMemo(
        () => ({
            favorites,
            toggleFavorite,
            removeFavorite,
            isFavorite: (id: string) => favorites.some((fav) => fav.id === id),
        }),
        [favorites, toggleFavorite, removeFavorite]
    );

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites deve ser usado dentro de FavoritesProvider");
    }
    return context;
}
