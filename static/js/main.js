document.addEventListener('DOMContentLoaded', function() {
    // 获取所有输入元素
    const protocolCheckboxes = document.querySelectorAll('input[name="protocol"]');
    const tcpFlagCheckboxes = document.querySelectorAll('input[name="tcpflag"]');
    const sourceIP = document.getElementById('sourceIP');
    const destIP = document.getElementById('destIP');
    const sourceIPMask = document.getElementById('sourceIPMask');
    const destIPMask = document.getElementById('destIPMask');
    const sourcePort = document.getElementById('sourcePort');
    const destPort = document.getElementById('destPort');
    const commonSourcePorts = document.getElementById('commonSourcePorts');
    const commonDestPorts = document.getElementById('commonDestPorts');
    const minLength = document.getElementById('minLength');
    const maxLength = document.getElementById('maxLength');
    const relativeTime = document.getElementById('relativeTime');
    const customFilter = document.getElementById('customFilter');
    const filterCommand = document.getElementById('filterCommand');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearButton');
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    const keyword = document.getElementById('keyword-search');

    // 标签页切换功能
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            
            // 更新按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新内容显示
            tabContents.forEach(content => {
                if (content.id === tab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // 常用端口选择功能
    commonSourcePorts.addEventListener('change', function() {
        if (this.value) {
            sourcePort.value = this.value;
            generateFilter();
        }
    });

    commonDestPorts.addEventListener('change', function() {
        if (this.value) {
            destPort.value = this.value;
            generateFilter();
        }
    });

    // 为所有输入元素添加事件监听器
    const inputs = [sourceIP, destIP, sourcePort, destPort, minLength, maxLength, relativeTime, customFilter];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', generateFilter);
        }
    });

    [sourceIPMask, destIPMask].forEach(select => {
        if (select) {
            select.addEventListener('change', generateFilter);
        }
    });

    protocolCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', generateFilter);
    });

    tcpFlagCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', generateFilter);
    });

    // 生成过滤命令
    function generateFilter() {
        let filters = [];

        // 如果有自定义过滤器，直接使用它
        if (customFilter.value.trim()) {
            filterCommand.value = customFilter.value.trim();
            return;
        }

        // 处理协议过滤
        const selectedProtocols = Array.from(protocolCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        if (selectedProtocols.length > 0) {
            if (selectedProtocols.length === 1) {
                filters.push(selectedProtocols[0]);
            } else {
                const protocolFilter = selectedProtocols.join(' or ');
                filters.push(`(${protocolFilter})`);
            }
        }

        // 处理IP地址过滤
        if (sourceIP.value) {
            const mask = sourceIPMask.value;
            filters.push(`ip.src == ${sourceIP.value}${mask}`);
        }
        if (destIP.value) {
            const mask = destIPMask.value;
            filters.push(`ip.dst == ${destIP.value}${mask}`);
        }

        // 处理端口过滤
        if (sourcePort.value) {
            filters.push(`tcp.srcport == ${sourcePort.value}`);
        }
        if (destPort.value) {
            filters.push(`tcp.dstport == ${destPort.value}`);
        }

        // 处理TCP标志
        const selectedFlags = Array.from(tcpFlagCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => `tcp.flags.${cb.value} == 1`);
        
        if (selectedFlags.length > 0) {
            if (selectedFlags.length === 1) {
                filters.push(selectedFlags[0]);
            } else {
                const flagsFilter = selectedFlags.join(' and ');
                filters.push(`(${flagsFilter})`);
            }
        }

        // 处理数据包长度过滤
        if (minLength.value) {
            filters.push(`frame.len >= ${minLength.value}`);
        }
        if (maxLength.value) {
            filters.push(`frame.len <= ${maxLength.value}`);
        }

        // 处理时间过滤
        if (relativeTime.value) {
            filters.push(`frame.time_relative <= ${relativeTime.value}`);
        }

        // 组合所有过滤条件
        const finalFilter = filters.join(' and ');
        filterCommand.value = finalFilter || ''; // 如果没有过滤条件则显示空字符串
    }

    // Function to apply filters based on user input
    function applyFilters() {
        const startDateValue = startDate.value;
        const endDateValue = endDate.value;
        const keywordValue = keyword.value.toLowerCase();

        // Logic to apply date range filter
        if (startDateValue && endDateValue) {
            console.log(`Filtering from ${startDateValue} to ${endDateValue}`);
            // Add logic to filter data based on date range
        }

        // Logic to apply keyword filter
        if (keywordValue) {
            console.log(`Filtering with keyword: ${keywordValue}`);
            // Add logic to filter data based on keyword
        }

        // Add additional filter logic as needed
    }

    // Event listeners for filter inputs
    const filterInputs = document.querySelectorAll('.options input');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // 复制命令功能
    copyButton.addEventListener('click', function() {
        filterCommand.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i> 已复制！';
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 2000);
    });

    // 清除功能
    clearButton.addEventListener('click', function() {
        // 清除所有复选框
        protocolCheckboxes.forEach(cb => cb.checked = false);
        tcpFlagCheckboxes.forEach(cb => cb.checked = false);
        
        // 清除所有输入框
        inputs.forEach(input => {
            if (input) {
                input.value = '';
            }
        });
        
        // 重置选择框
        [sourceIPMask, destIPMask, commonSourcePorts, commonDestPorts].forEach(select => {
            if (select) {
                select.selectedIndex = 0;
            }
        });
        
        // 清除结果
        filterCommand.value = '';
    });

    // 初始生成一次过滤命令
    generateFilter();
});
