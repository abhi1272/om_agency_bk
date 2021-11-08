const mongoose = require("mongoose");
Schema = mongoose.Schema;

let designSchema = new Schema(
  {
    page_key: {
      type: String,
      require: true,
      trim: true,
    },
    page_name: {
      type: String,
      require: true,
      trim: true,
    },
    add_button: {
      enabled: {
        type: Boolean,
        require: true,
        trim: true,
      },
    },
    bulk_button: {
        enabled: {
            type: Boolean,
            require: true,
            trim: true,
          },
    },
    api_details: {
      api_url: { type: String },
      method: { type: String },
      faql_enabled: { type: Boolean },
      fixed_faql: {
        type: Object,
      },
    },
    columns: [{ type: Object }],
    landing_behaviour: {
      type: Object,
    },
    actions: [{ type: Object }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Design", designSchema);
