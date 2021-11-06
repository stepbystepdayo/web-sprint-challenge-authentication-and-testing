const db = require("../../data/dbConfig");

const findById = async (id) => {
  // console.log("i am in findBy", id);
  return await db("users").where("id", id).orderBy("id").first();
};

const add = async ({ username, password }) => {
  // console.log("i am in add functrion", username, password);
  const [id] = await db("users").insert({ username, password });
  // console.log("before the findBy", id);
  return findById(id);
};

const findBy = (filter) => {
  console.log(filter);
  return db("users as u").where(filter);
};

module.exports = { findById, add, findBy };
