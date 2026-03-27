import rateLimit from "express-rate-limit";

// Rate limiter GLOBAL - padrão para toda a API
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: "Muitas requisições deste IP, tente novamente mais tarde.", 
  standardHeaders: true, // Retorna info do rate limit em `RateLimit-*` headers
  legacyHeaders: false, // Desativa `X-RateLimit-*` headers
  skip: (req) => req.path === "/health", // Não aplica rate limit em /health
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});