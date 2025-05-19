export function ExportDownload(data: any, name: string) {
  const blob = data instanceof Blob ? data : new Blob([data]);

  // 创建临时下载链接
  const downloadLink = URL.createObjectURL(data);

  // 创建一个链接元素（<a>标签）
  const linkElement = document.createElement("a");
  linkElement.href = downloadLink;
  // 设置下载时的文件名为Excel文件
  linkElement.download = name + ".xlsx";

  // 触发链接元素的点击事件，以模拟用户点击下载链接
  linkElement.click();

  // 在下载完成后，释放临时下载链接
  URL.revokeObjectURL(downloadLink);
}


export function ExportPdfDownload(data: any, name: string) {
  const blob = data instanceof Blob ? data : new Blob([data]);

  // 创建临时下载链接
  const downloadLink = URL.createObjectURL(data);

  // 创建一个链接元素（<a>标签）
  const linkElement = document.createElement("a");
  linkElement.href = downloadLink;
  // 设置下载时的文件名为Excel文件
  linkElement.download = name + ".pdf";

  // 触发链接元素的点击事件，以模拟用户点击下载链接
  linkElement.click();

  // 在下载完成后，释放临时下载链接
  URL.revokeObjectURL(downloadLink);
}

export function ExportWordDownload(data: any, name: string) {
  const blob = data instanceof Blob ? data : new Blob([data]);

  // 创建临时下载链接
  const downloadLink = URL.createObjectURL(data);

  // 创建一个链接元素（<a>标签）
  const linkElement = document.createElement("a");
  linkElement.href = downloadLink;
  // 设置下载时的文件名为Excel文件
  linkElement.download = name + ".docx";

  // 触发链接元素的点击事件，以模拟用户点击下载链接
  linkElement.click();

  // 在下载完成后，释放临时下载链接
  URL.revokeObjectURL(downloadLink);
}