import api from '../axiosConfig';

/**
 * Servicio para consultar recomendaciones de libros (Top 10 mejor calificados).
 * Endpoints públicos: GET /api/v1/recommendations/ o /recommendation/
 */
export const recommendationService = {
  getAll: () => api.get('/recommendations/'),
  getRecommendations: () => api.get('/recommendations/'),
};

export default recommendationService;
