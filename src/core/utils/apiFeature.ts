type QueryString = {
  page?: number
  sort?: string
  limit?: number
  fields?: string
  search?: string
}

export default class APIFeatures {
  public query: any
  public queryString: QueryString
  constructor(query: any, queryString: QueryString) {
    ;(this.query = query), (this.queryString = queryString)


  filter() {
    if (!this.queryString.search) {
      const excludedFields = ['page', 'sort', 'limit', 'fields']
      const objQuery = {...this.queryString}
      excludedFields.forEach((el) => delete objQuery[el as keyof QueryString])

      let queryStr = JSON.stringify(objQuery)
      queryStr = queryStr.replace(/\b(lt| lte | gt | gte)\b/g, (match) => `$${match}`)

      this.query.find(JSON.parse(queryStr))
    }
    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limit() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(',').join(' ')
      this.query.select(field)
    } else {
      this.query.select('-__v')
    }
    return this
  }

  paginate() {
    if (!this.queryString.page || !this.queryString.limit) {
      return this;
    }
    const page = Number(this.queryString.page) || 1
    const limit = Number(this.queryString.limit) || 100
    const skip = (page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}
