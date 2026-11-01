import Joi from "joi";

function joiFromCustom(custom) {
  const output = {};
  custom.forEach((field) => {
    if (field.kind === "text" || field.kind === "link") {
      output[field.key] = Joi.string().allow("");
    }
    if (field.kind === "list") {
      output[field.key] = Joi.array().allow("");
    }
  });
  return output;
}

function createEventSchema(custom) {
  return Joi.object()
    .keys({
      id: Joi.string().allow(""),
      civId: Joi.string().allow(""),
      description: Joi.string().allow("").required(),
      graphic: Joi.string().allow(""),
      date: Joi.string().allow(""),
      time: Joi.string().allow(""),
      time_precision: Joi.string().allow(""),

      /* map */
      location: Joi.string().allow(""),
      latitude: Joi.string().allow(""),
      longitude: Joi.string().allow(""),
      /* space */
      x: Joi.string().allow(""),
      y: Joi.string().allow(""),
      z: Joi.string().allow(""),

      type: Joi.string().allow(""),
      category: Joi.string().allow(""),
      category_full: Joi.string().allow(""),
      associations: Joi.array().default([]),
      sources: Joi.array(),
      comments: Joi.string().allow(""),
      time_display: Joi.string().allow(""),
      // nested
      narrative___stepStyles: Joi.array(),
      shape: Joi.string().allow(""),
      colour: Joi.string().allow(""),

      /* Gamboa Ocean */
      // event name, shown as "Evento: ..." in both bars
      titulo: Joi.string().allow(""),
      // Mapbox style layer ids shown while the event is selected
      camadas: Joi.array().items(Joi.string()),
      // map view applied when the event is selected
      vista: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        zoom: Joi.number().required(),
      }),
      // content of the right bar (multimídia) and the left bar (sociograma)
      multimidia: Joi.array().items(Joi.object()),
      sociograma: Joi.array().items(Joi.object()),
      ...joiFromCustom(custom),
    })
    .and("latitude", "longitude")
    .or("date", "latitude");
}

export default createEventSchema;
