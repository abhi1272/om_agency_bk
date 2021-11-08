const DesignModel = require("../models/Design");
const { v4: uuidv4 } = require("uuid");
const response = require('../libs/responseLib');

const creatTableDesign = async (body) => {
const page_key = body.modelName.split(' ').join('_').toLowerCase()
  const designObj = {
    page_key: page_key,
    page_name: body.modelName,
    add_button: {
      enabled: true,
    },
    bulk_button: {
      enabled: false,
    },
    api_details: {
        api_url: `/${page_key}`,
        method: "GET",
        faql_enabled: true,
        fixed_faql: {
          filters: [],
        },
      },
    landing_behaviour: {
      filters: [],
      pagination: true,
      selection: true,
      meta: {
        pagination: true,
        selection: true,
        name: "No Filter",
      }
    },
    actions: [
      {
        api_details: {
          api_url: "/exam/:uuid",
          method: "DELETE",
        },
        page_name: "Delete E-Exam",
        page_key: "delete_e_exam",
        type: {
          name: "menu_item",
          selection: "single",
          action: "delete",
        },
      },
    ],
  };

  designObj["columns"] = await createColumns(body.modelObj);

  let Design = DesignModel({
    ...designObj,
    uuid: uuidv4(),
  });

  Design.save((err, result) => {
    if (err) {
      console.log("err", err);
      let apiResponse = response.generate(true, "some error occurred", 400, err);
      res.send(apiResponse);
    } else {
      let apiResponse = response.generate(
        true,
        `Design saved`,
        200,
        result
      );
      console.log('apiResponse', apiResponse)
    }
  });
};

const createColumns = async (designColumnArr) => {
    console.log('designColumnArr',designColumnArr)
  let columns = []

  designColumnArr.map((item) => {
      console.log(item)
      const columnObj = {
        name: item.fieldName,
        key: item.fieldName.split(' ').join('_').toLowerCase(),
        sorting_enabled: true,
        filter: true,
        column_priority: "primary",
        type: {
          name: item.type,
        },
      }
      columns.push(columnObj)
  })
  console.log(columns)
  return columns
}

module.exports = {
    creatTableDesign
}