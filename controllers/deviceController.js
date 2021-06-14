const uuid = require("uuid");
const path = require("path");
const { Device, DeviceInfo } = require("../models/models");
const ApiError = require("../error/ApiError");

class DeviceController {
  async create(req, res, next) {
    try {
      const { name, price, brandId, typeId, info } = req.body;
      let { img } = req.files;
      console.log(img, name, typeId);
      let fileName = uuid.v4() + ".jpg";
      console.log(img.mv);
      img.mv(path.resolve(__dirname, "..", "static", fileName));

      const device = await Device.create({
        name,
        price,
        brandId,
        typeId,
        img: fileName,
      });

      if (info) {
        info = JSON.parse(info);
        info.forEach((i) => {
          Device.create({
            title: i.title,
            description: i.description,
            deviceId: device.id,
          });
        });
      }

      res.json(device);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }
  async getAll(req, res) {
    let { brandId, typeId, limit, page } = req.query;
    page = page || 1;
    limit = limit || 9;
    let offset = page * limit - limit;
    let devices;

    if (!brandId && !typeId) {
      console.log(page, offset);
      devices = await Device.findAndCountAll({ limit, offset });
    } else if (brandId && !typeId) {
      devices = await Device.findAndCountAll({ where: { brandId } });
    } else if (!brandId && typeId) {
      devices = await Device.findAndCountAll({ where: { typeId } });
    } else if (brandId && typeId) {
      devices = await Device.findAndCountAll({ where: { typeId, brandId } });
    }
    res.json(devices);
  }

  async getOne(req, res) {
    const { id } = req.params;
    console.log(id);
    const device = await Device.findOne({
      where: { id },
      include: [{ model: DeviceInfo, as: "info" }],
    });
    res.json(device);
  }
}

module.exports = new DeviceController();
