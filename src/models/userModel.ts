import dbHelper from "../helpers/dbHelper";
import { user as User } from "../helpers/dbNamespaceHelper";
import { toBoolean } from "src/helpers/conversionHelper";
import { encryptTextHex, booleanToString, decryptHexId } from "src/helpers/utilHelper";

interface UserSearch {
  user: User;
}


export const updateOnlyNullFields = async (userId: number | string, user: User | object) => {
  const db = new dbHelper();

  const result = await
    db.updateOnlyNullFields("user", user)
      .where("id", decryptHexId(userId))
      .resolve();

  return result;
};


export const getById = async ({ userId, fields }: { userId: string, fields?: string[] }) => {
  const db = new dbHelper();

  if (fields?.length)
    db.select(fields.join(","));
  else
    db.select(defaultReturn());

  db.from("user");

  db.where("id", decryptHexId(userId));

  const result = await db.resolve() as UserSearch[];

  return encryptId(result);
};

export const getByEmail = async ({ email, fields }: { email: string, fields?: string[] }) => {
  const db = new dbHelper();

  if (fields?.length)
    db.select(fields.join(","));
  else
    db.select(defaultReturn());

  db.from("user");
  db.where("email", email);

  const result = await db.resolve() as UserSearch[];

  return encryptId(result);
};

export const getWhere = async ({ key, value, fields }: { key: string, value: string | number, fields?: string }) => {
  const db = new dbHelper();

  if (fields?.length)
    db.select(fields);
  else
    db.select(defaultReturn());

  db.from("user");

  db.where(key, value);

  const result = await db.resolve() as UserSearch[];

  return encryptId(result);
};

export const getByName = async ({ name, fields }: { name: string, fields?: string[] }) => {
  const db = new dbHelper();

  if (fields?.length)
    db.select(fields.join(","));
  else
    db.select(defaultReturn());

  db.from("user");
  db.where("full_name").like(`%${name}%`);

  const result = await db.resolve() as UserSearch[];

  return encryptId(result);
};

export const getAll = async ({ assistant, limit, offset, fields }:
  { assistant?: string, limit: number, offset: number, fields?: string }) => {

  const db = new dbHelper();

  if (fields?.length)
    db.select(fields);
  else
    db.select(defaultReturn());

  db.from("user");

  if (limit && offset)
    db.pagination(limit, offset);

  if (assistant !== undefined)
    db.where("is_assistant", toBoolean(assistant) ? "1" : "0");

  const result = await db.resolve() as UserSearch[];

  return encryptId(result);
};

export const update = async (userId: number, user: User | any) => {
  const db = new dbHelper();

  if (user.is_assistant)
    user.is_assistant = booleanToString(user.is_assistant);
  if (user.verified_assistant)
    user.verified_assistant = booleanToString(user.verified_assistant);

  const result = await
    db.update("user", user)
      .where("id", decryptHexId(userId))
      .resolve();

  return result;
};

export const deleteById = async (userId: number) => {
  const db = new dbHelper();

  const result = await
    db.delete()
      .from("user")
      .where("id", decryptHexId(userId))
      .resolve();

  return result;
};

export const updateProfilePicture = async ({ userId, imagePath }: { userId: number, imagePath: string }) => {
  const db = new dbHelper();

  const result = await
    db.update("user", { profile_picture: imagePath })
      .where("id", decryptHexId(userId))
      .resolve();

  return result;
};

function defaultReturn() {
  return `
    id,
    full_name,
    created_at,
    email
  `;
}

const encryptId = (list: UserSearch[]) => {
  return list.map(item => {
    const newItem = { ...item };


    if (item.user?.id) {
      const userId = encryptTextHex(item.user.id);
      newItem.user.id = userId;
    }

    if (item.user?.course_id) {
      const courseId = encryptTextHex(item.user.course_id);
      newItem.user.course_id = courseId;
    }

    return newItem;
  });
};