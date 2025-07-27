import * as CONST from "../common/const";

interface RPCCallInfo {
  method: string;
  params: any;
  startTime: number;
  contractAddress?: string;
  functionName?: string;
}

let currentRPCCall: RPCCallInfo | null = null;
let modalElement: HTMLElement | null = null;
let intervalId: NodeJS.Timeout | null = null;

export function showRPCModal(
  method: string,
  params: any,
  contractAddress?: string,
  functionName?: string
): void {
  currentRPCCall = {
    method,
    params,
    startTime: Date.now(),
    contractAddress,
    functionName,
  };

  createModal();
  updateModalContent();

  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(updateModalContent, 100);
}

export function hideRPCModal(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (modalElement) {
    modalElement.remove();
    modalElement = null;
  }

  currentRPCCall = null;
}

function createModal(): void {
  if (modalElement) {
    return;
  }

  modalElement = document.createElement("div");
  modalElement.className = "rpc-modal-overlay";
  modalElement.innerHTML = `
        <div class="rpc-modal-content">
            <div class="rpc-modal-header">
                <div class="rpc-spinner"></div>
                <span id="rpc-status-text">接続中...</span>
            </div>
            <div class="rpc-modal-body">
                <div class="rpc-details"></div>
            </div>
        </div>
    `;

  document.body.appendChild(modalElement);
}

function updateModalContent(): void {
  if (!modalElement || !currentRPCCall) {
    return;
  }

  const detailsElement = modalElement.querySelector(".rpc-details");
  if (!detailsElement) {
    return;
  }

  const elapsedTime = ((Date.now() - currentRPCCall.startTime) / 1000).toFixed(
    1
  );

  let detailsHTML = "";

  // paramsがオブジェクトでcontract/methodが含まれている場合
  if (
    currentRPCCall.params &&
    typeof currentRPCCall.params === "object" &&
    currentRPCCall.params.contract
  ) {
    detailsHTML += `
            <div class="rpc-detail-item">
                <span class="rpc-label">CA:</span>
                <span class="rpc-value" title="${currentRPCCall.params.contract}">
                    ${currentRPCCall.params.contract}
                </span>
            </div>
            <div class="rpc-detail-item">
                <span class="rpc-label">method:</span>
                <span class="rpc-value">${currentRPCCall.params.method}</span>
            </div>
        `;

    if (
      currentRPCCall.params.params &&
      currentRPCCall.params.params !== "none"
    ) {
      detailsHTML += `
                <div class="rpc-detail-item">
                    <span class="rpc-label">params:</span>
                    <span class="rpc-value">${formatSmartContractParams(
                      currentRPCCall.params.params
                    )}</span>
                </div>
            `;
    }
  } else {
    // 通常の表示
    detailsHTML += `
            <div class="rpc-detail-item">
                <span class="rpc-label">method:</span>
                <span class="rpc-value">${currentRPCCall.method}</span>
            </div>
        `;
  }

  // スマートコントラクト以外の通常のRPCメソッドの場合のみ追加情報を表示
  if (
    !currentRPCCall.params ||
    typeof currentRPCCall.params !== "object" ||
    !currentRPCCall.params.contract
  ) {
    if (
      currentRPCCall.params &&
      Object.keys(currentRPCCall.params).length > 0
    ) {
      // 通常のパラメータ表示
      detailsHTML += `
                <div class="rpc-detail-item">
                    <span class="rpc-label">パラメータ:</span>
                    <div class="rpc-params">
                        ${formatParams(currentRPCCall.params)}
                    </div>
                </div>
            `;
    }
  }

  // 経過時間をヘッダーに表示
  const statusElement = modalElement.querySelector("#rpc-status-text");
  if (statusElement) {
    statusElement.textContent = `ブロックチェーンに問い合わせています 経過時間:${elapsedTime}秒`;
  }

  detailsElement.innerHTML = detailsHTML;
}

function formatParams(params: any): string {
  if (typeof params === "string") {
    return `<div class="rpc-param">${formatParamValue(params)}</div>`;
  }

  if (Array.isArray(params)) {
    return params
      .map(
        (param, index) =>
          `<div class="rpc-param">[${index}]: ${formatParamValue(param)}</div>`
      )
      .join("");
  }

  if (typeof params === "object" && params !== null) {
    return Object.entries(params)
      .map(([key, value]) => {
        // param0, param1などの場合は、値の詳細を展開して表示
        if (key.startsWith("param") && typeof value === "object") {
          return `<div class="rpc-param">${key}: ${formatDetailedParam(
            value
          )}</div>`;
        }
        return `<div class="rpc-param">${key}: ${formatParamValue(
          value
        )}</div>`;
      })
      .join("");
  }

  return `<div class="rpc-param">${params}</div>`;
}

function formatArgs(args: any[]): string {
  if (args.length === 0) return "なし";

  return args
    .map((arg, index) => {
      const formatted = formatParamValue(arg);
      return formatted;
    })
    .join(", ");
}

function formatSmartContractParams(params: any): string {
  if (!params) return "";

  if (Array.isArray(params)) {
    if (params.length === 0) return "なし";

    return params
      .map((param, index) => {
        if (typeof param === "string") {
          return param;
        } else if (typeof param === "bigint") {
          return param.toString();
        } else if (typeof param === "object" && param !== null) {
          return JSON.stringify(param);
        }
        return String(param);
      })
      .join(", ");
  }

  return String(params);
}

function formatParamValue(value: any): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    // BigNumberやその他の特殊なオブジェクトの処理
    if (value._isBigNumber || value.type === "BigNumber") {
      return value.hex || value.toString();
    }
    return JSON.stringify(value);
  }

  return String(value);
}

function formatDetailedParam(value: any): string {
  if (value === null || value === undefined) {
    return "null";
  }

  // オブジェクトの詳細を表示
  if (typeof value === "object") {
    // 配列の場合
    if (Array.isArray(value)) {
      return `[${value.map((v) => formatParamValue(v)).join(", ")}]`;
    }

    // オブジェクトの場合、主要なプロパティを表示
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return "{}";
    }

    // すべてのプロパティを表示
    const displayEntries = entries.map(([k, v]) => {
      return `${k}: ${formatParamValue(v)}`;
    });

    return `{${displayEntries.join(", ")}}`;
  }

  return formatParamValue(value);
}
