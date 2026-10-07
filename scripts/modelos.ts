// Descarga (una sola vez, con internet) el modelo local de embeddings a ./models para usarlo sin conexión.
//   npm run models
import { MODELO_EMBEDDINGS, embeber } from "../src/lib/embeddings";

embeber(["prueba de descarga"]).then(
  ([v]) => console.log(`Modelo ${MODELO_EMBEDDINGS} listo en ./models (dimensión ${v.length}).`),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
