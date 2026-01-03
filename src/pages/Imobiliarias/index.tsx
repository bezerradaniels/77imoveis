import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo";
import { supabase } from "../../components/lib/supabase/client";
import { Button } from "../../components/ui/button";

type Imobiliaria = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  logo_url?: string;
  city?: string;
  state?: string;
  address?: string;
  website?: string;
};

export default function Imobiliarias() {
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [filteredImobiliarias, setFilteredImobiliarias] = useState<Imobiliaria[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImobiliarias();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setFilteredImobiliarias(imobiliarias.filter(imobiliaria => imobiliaria.city === selectedCity));
    } else {
      setFilteredImobiliarias(imobiliarias);
    }
  }, [selectedCity, imobiliarias]);

  async function fetchImobiliarias() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "imobiliaria")
        .eq("active", true);

      if (error) throw error;
      
      setImobiliarias(data || []);
      setFilteredImobiliarias(data || []);
      
      const uniqueCities = [...new Set(data?.map(i => i.city).filter(Boolean) || [])];
      setCities(uniqueCities);
    } catch (error) {
      console.error("Erro ao buscar imobiliárias:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="77 Imóveis | Imobiliárias" />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Imobiliárias</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encontre as melhores imobiliárias do DDD 77 para ajudar você a comprar, alugar ou vender imóveis.
              </p>
            </div>

            <div className="mt-8 max-w-md mx-auto">
              <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por cidade
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="">Todas as cidades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Carregando imobiliárias...</div>
            </div>
          ) : filteredImobiliarias.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {selectedCity ? "Nenhuma imobiliária encontrada nesta cidade." : "Nenhuma imobiliária cadastrada no momento."}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImobiliarias.map((imobiliaria) => (
                <div key={imobiliaria.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-lime-100 rounded-lg flex items-center justify-center">
                      {imobiliaria.logo_url ? (
                        <img
                          src={imobiliaria.logo_url}
                          alt={imobiliaria.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-lime-600 font-bold text-lg">
                          {imobiliaria.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{imobiliaria.name}</h3>
                    </div>
                  </div>

                  {imobiliaria.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{imobiliaria.bio}</p>
                  )}

                  {(imobiliaria.city || imobiliaria.state) && (
                    <div className="text-sm text-gray-500 mb-4">
                      📍 {imobiliaria.city && imobiliaria.state ? `${imobiliaria.city} - ${imobiliaria.state}` : imobiliaria.city || imobiliaria.state}
                    </div>
                  )}

                  {imobiliaria.address && (
                    <div className="text-sm text-gray-500 mb-4">
                      🏢 {imobiliaria.address}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/perfil/imobiliaria/${imobiliaria.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Perfil
                      </Button>
                    </Link>
                    {imobiliaria.phone && (
                      <Button size="sm" className="bg-lime-500 hover:bg-lime-600">
                        Contatar
                      </Button>
                    )}
                  </div>

                  {imobiliaria.website && (
                    <div className="mt-3">
                      <a
                        href={imobiliaria.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-lime-600 hover:text-lime-700 flex items-center gap-1"
                      >
                        🌐 Visitar site
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
