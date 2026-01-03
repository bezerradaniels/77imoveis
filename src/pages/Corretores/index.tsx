import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo";
import { supabase } from "../../components/lib/supabase/client";
import { Button } from "../../components/ui/button";

type Corretor = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  creci?: string;
};

export default function Corretores() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [filteredCorretores, setFilteredCorretores] = useState<Corretor[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCorretores();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setFilteredCorretores(corretores.filter(corretor => corretor.city === selectedCity));
    } else {
      setFilteredCorretores(corretores);
    }
  }, [selectedCity, corretores]);

  async function fetchCorretores() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "corretor")
        .eq("active", true);

      if (error) throw error;
      
      setCorretores(data || []);
      setFilteredCorretores(data || []);
      
      const uniqueCities = [...new Set(data?.map(c => c.city).filter(Boolean) || [])];
      setCities(uniqueCities);
    } catch (error) {
      console.error("Erro ao buscar corretores:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="77 Imóveis | Corretores" />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Corretores de Imóveis</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encontre profissionais qualificados para ajudar você a comprar, alugar ou vender imóveis no DDD 77.
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
              <div className="text-gray-500">Carregando corretores...</div>
            </div>
          ) : filteredCorretores.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {selectedCity ? "Nenhum corretor encontrado nesta cidade." : "Nenhum corretor cadastrado no momento."}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCorretores.map((corretor) => (
                <div key={corretor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
                      {corretor.avatar_url ? (
                        <img
                          src={corretor.avatar_url}
                          alt={corretor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lime-600 font-semibold text-lg">
                          {corretor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{corretor.name}</h3>
                      {corretor.creci && (
                        <p className="text-sm text-gray-500">CRECI: {corretor.creci}</p>
                      )}
                    </div>
                  </div>

                  {corretor.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{corretor.bio}</p>
                  )}

                  {(corretor.city || corretor.state) && (
                    <div className="text-sm text-gray-500 mb-4">
                      📍 {corretor.city && corretor.state ? `${corretor.city} - ${corretor.state}` : corretor.city || corretor.state}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/perfil/corretor/${corretor.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Perfil
                      </Button>
                    </Link>
                    {corretor.phone && (
                      <Button size="sm" className="bg-lime-500 hover:bg-lime-600">
                        Contatar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
