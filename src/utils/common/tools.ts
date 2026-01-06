import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'

/**
 * 导出列配置
 */
export interface ExportColumnConfig {
  /** 列标题 */
  label: string
  /** 数据字段名 */
  prop: string
  /**
   * 数据类型
   * - text: 普通文本
   * - number: 数值
   * - switch: 开关按钮（导出为"开"/"关"）
   * - computed: 计算值（需要提供 getValue 函数）
   */
  type?: 'text' | 'number' | 'switch' | 'computed'
  /**
   * 自定义取值函数（用于计算值或从映射获取显示名称）
   * @param row 行数据
   * @returns 显示值
   */
  getValue?: (row: any) => string | number
  /** 列宽度 */
  width?: number
}

/**
 * 导出 Excel 配置选项
 */
export interface ExportExcelOptions<T = any> {
  /** 导出的数据 */
  data: T[]
  /** 列配置 */
  columns: ExportColumnConfig[]
  /** 文件名（不含扩展名） */
  filename?: string
  /** 工作表名称 */
  sheetName?: string
  /** 是否添加序号列 */
  autoIndex?: boolean
}

/**
 * 格式化单元格值
 * @param row 行数据
 * @param column 列配置
 * @returns 格式化后的值
 */
function formatCellValue<T>(row: T, column: ExportColumnConfig): string {
  // 如果有自定义取值函数，使用它
  if (column.getValue) {
    const value = column.getValue(row)
    return value === null || value === undefined ? '-' : String(value)
  }

  const value = (row as any)[column.prop]

  // 处理开关类型
  if (column.type === 'switch') {
    return value === 1 || value === true ? '开' : '关'
  }

  // 处理数值类型
  if (column.type === 'number') {
    if (value === null || value === undefined) return '0'
    return typeof value === 'number' ? value.toFixed(2) : String(value)
  }

  // 处理空值
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

/**
 * 导出表格数据到 Excel 文件
 * @param options 导出选项
 */
export async function exportToExcel<T = any>(options: ExportExcelOptions<T>): Promise<void> {
  const {
    data,
    columns,
    filename = `export_${new Date().toISOString().slice(0, 10)}`,
    sheetName = 'Sheet1',
    autoIndex = false
  } = options

  if (!data || data.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  try {
    // 构建表头
    const headers: string[] = []
    if (autoIndex) {
      headers.push('序号')
    }
    columns.forEach((col) => {
      headers.push(col.label)
    })

    // 构建数据行
    const rows: (string | number)[][] = data.map((row, index) => {
      const rowData: (string | number)[] = []

      if (autoIndex) {
        rowData.push(index + 1)
      }

      columns.forEach((col) => {
        rowData.push(formatCellValue(row, col))
      })

      return rowData
    })

    // 合并表头和数据
    const sheetData = [headers, ...rows]

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData)

    // 设置列宽
    const colWidths: XLSX.ColInfo[] = []
    if (autoIndex) {
      colWidths.push({ wch: 8 })
    }
    columns.forEach((col) => {
      colWidths.push({ wch: col.width || 15 })
    })
    worksheet['!cols'] = colWidths

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      compression: true
    })

    // 创建 Blob 并下载
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 使用时间戳确保文件名唯一
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const finalFilename = `${filename}_${timestamp}.xlsx`

    FileSaver.saveAs(blob, finalFilename)

    ElMessage.success(`成功导出 ${data.length} 条数据`)
  } catch (error) {
    console.error('Excel 导出错误:', error)
    ElMessage.error('导出失败，请重试')
    throw error
  }
}
