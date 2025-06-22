import Airtable from "airtable";
import "dotenv/config";
const airtableBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const airtableTable = airtableBase(process.env.AIRTABLE_TABLE_NAME);
export { airtableBase, airtableTable };
