// **** DXF Export control
window.GCComponents["Controls"].addControl('control-dxfexport', function (map) {
    return new OpenLayers.Control.DXFExport({
        gc_id: 'control-dxfexport',
        tbarpos: "first",
        //type: OpenLayers.Control.TYPE_TOGGLE,
        baseUrl: self.baseUrl,
        defaultLayers: self.mapsetTiles ? self.activeLayers.slice(0) : [],
        formId: 'dxfexportpanel',
        exclusiveGroup: 'sidebar',
        iconclass: "glyphicon-white glyphicon-export",
        title: "Esporta DXF",
        waitFor: 'panelready',
        allowDrag: true,
        trigger: function () {
            if (sidebarPanel.handleEvent) {
                if (this.active) {
                    this.deactivate();
                    sidebarPanel.hide('exportpanel');
                }
                else {
                    this.activate();
                    var me = this;
                    if ($.trim($('#exportpanel').html()) == '') {
                        var rnd = Math.floor((Math.random() * 100000) + 1); //rimozione manuale della cache
                        $("#exportpanel").load('../../panels/export_panel.html?' + rnd, function () {
                            me.events.triggerEvent('panelready');
                        });
                    }
                    else {
                        //this.drawPrintArea();
                    }

                    sidebarPanel.show('exportpanel');
                }
                sidebarPanel.handleEvent = false;
            }
        },
        eventListeners: {
            'panelready': function (event) {
                var me = this, timerid;
                var themeList = []; //contiene gli elementi che genereranno gli input
                for (var i = 0; i < this.map.config.layers.length; i++) {
                    var cfgLayer = this.map.config.layers[i];
                    if (cfgLayer.typeId == 4 || cfgLayer.typeId == 5 || cfgLayer.typeId == 7 || cfgLayer.typeId == 8)
                        continue;
                    if (typeof (cfgLayer.options) !== 'undefined') {
                        var layerOpts = cfgLayer.options;
                    }
                    else {
                        var layerOpts = cfgLayer.parameters;
                    }
                    var theme = $.grep(themeList, function (e) { return e.themeLabel == layerOpts.theme });
                    if (theme.length == 0) {
                        var theme = {};
                        theme.themeLabel = layerOpts.theme;
                        theme.themeIds = [];
                        theme.themeIds.push(layerOpts.theme_id);
                        theme.mapsetName = this.map.config.mapsetName;
                        themeList.push(theme);
                    } else {
                        theme = theme[0];
                        if (!theme.themeIds.includes(layerOpts.theme_id)) {
                            theme.themeIds.push(layerOpts.theme_id);
                        }
                    }
                }
                var container = $('#dxfexport_themes_group');
                var inputs = container.find('input');
                var id = inputs.length + 1;
                var atLeastOneCheck = false;
                themeList.forEach(function (element) {
                    $('<input />', {
                        type: 'checkbox',
                        id: 'dxfexport_theme_' + id,
                        class: 'dxfexport_themes',
                        value: theme.mapsetName + ',' + element.themeIds.join(',')
                    }).appendTo(container);
                    if ($.inArray(element.themeLabel.toLowerCase(), clientConfig.DXF_THEME_SELECTED) > -1) {
                        atLeastOneCheck = true;
                        $('#' + 'dxfexport_theme_' + id).prop('checked', true)
                    }
                    $('<label />', { 'for': 'dxfexport_theme_' + id, text: element.themeLabel }).appendTo(container);
                    if ($.mobile) {
                        $('#dxfexport_theme_' + id).checkboxradio();
                    }
                    else {
                        container.append('<br>');
                    }

                    id++;
                });

                if (!atLeastOneCheck) {
                    //    $('.dxfexport_themes').first().prop('checked', true).checkboxradio("refresh");
                    $('.dxfexport_themes').first().prop('checked', true);
                }
                $("#exportAreaSize").html((this.initialBBEdge * this.initialBBEdge) + " mq");
                $("#exportMaxAreaSize").html(this.maxArea + " mq");
                $("#exportMaxAreaSize").html(this.maxArea + " mq");
                $('.dxfexport_themes').on('change', function (event) {
                    event.preventDefault();
                    //$('#'+me.formId+' a[role="pdf"], #exportpanel a[role="html"]').attr('href', '#');
                    //$('#'+me.formId+' span[role="icon"]').removeClass('glyphicon-white').addClass('glyphicon-disabled');
                    me.updateUrl();
                });
                $("#map-select-scale").on('change', function (event) {
                    me.updateUrl();
                });
                
                $('#btnExportDxf').on('click', function (event) {
                    event.preventDefault();
                    me.downloadDXF();
                    return false;
                });

                //eventi per le opzioni avanzate
                $("#enableTemplateLayer").change(function () {
                    me.updateUrl();
                });
                $("#enableColors").change(function () {
                    me.updateUrl();
                });
                $("#enableLineThickness").change(function () {
                    me.updateUrl();
                });
				$("#exportEmptyLayers").change(function () {
                    me.updateUrl();
                });
                $("#textScaleMultiplier").change(function () {
                    me.updateUrl();
                });
                $("#labelScaleMultiplier").change(function () {
                    me.updateUrl();
                });
                $("#insertScaleMultiplier").change(function () {
                    me.updateUrl();
                });
                var mapSetDxfConfig = clientConfig.DXF_MAPSET_CONFIG.filter(function (element) {
                    return element.mapset === GisClientMap.mapsetName;
                });

                let textScaleMultiplier = mapSetDxfConfig.length ? mapSetDxfConfig[0].config.textScaleMultiplier : 1;
                let labelScaleMultiplier = mapSetDxfConfig.length ? mapSetDxfConfig[0].config.labelScaleMultiplier : 1;
                let insertScaleMultiplier = mapSetDxfConfig.length ? mapSetDxfConfig[0].config.insertScaleMultiplier : 1;
                let enableTemplateLayerChecked = mapSetDxfConfig.length ? mapSetDxfConfig[0].config.enableTemplateLayerChecked : true;
                let enableColorsChecked = mapSetDxfConfig.length ? mapSetDxfConfig[0].config.enableColorsChecked : true;
                let enableLineThicknessChecked = mapSetDxfConfig.length ? mapSetDxfConfig[0].config.enableLineThicknessChecked : true;
                let exportEmptyLayersChecked = mapSetDxfConfig.length ? mapSetDxfConfig[0].config.exportEmptyLayersChecked : false;
				$("#textScaleMultiplier").val(textScaleMultiplier);
                $("#labelScaleMultiplier").val(labelScaleMultiplier);
                $("#insertScaleMultiplier").val(insertScaleMultiplier);
                $("#enableTemplateLayer").prop('checked', enableTemplateLayerChecked);
                $("#enableColors").prop('checked', enableColorsChecked);
                $("#enableLineThickness").prop('checked', enableLineThicknessChecked);
				$("#exportEmptyLayers").prop('checked', exportEmptyLayersChecked);
				
				
				me.updateUrl();

            },
            'deactivate': function (event) {
                sidebarPanel.hide('exportpanel');
                this.removeExportBox();
            },
            'activate': function (event) {
                var me = this;
                if (me.map.currentControl != me) {
                    me.map.currentControl.deactivate();
                    me.map.currentControl = me;
                }
                //$('#'+me.formId+' input[name="scale_mode"]:checked').val() == 'user' ? me.boxScale = $('#'+me.formId+' input[name="scale"]').val() : me.boxScale = null;
                me.drawExportBox.apply(me);
            },
            'exporterd': function (event) {
                var me = this;
                if (event.format == 'HTML') {
                    $('#' + me.formId + ' a[role="html"]').attr('href', event.file);
                    $('#' + me.formId + ' a[role="html"] span[role="icon"]').removeClass('glyphicon-disabled').addClass('glyphicon-white');
                } else if (event.format == 'PDF') {
                    $('#' + me.formId + ' a[role="pdf"]').attr('href', event.file);
                    $('#' + me.formId + ' a[role="pdf"] span[role="icon"]').removeClass('glyphicon-disabled').addClass('glyphicon-white');
                }
                var win = window.open(event.file, '_blank');
                win.focus();
            }
        }
    });
});

// **** Toolbar button
window.GCComponents["SideToolbar.Buttons"].addButton(
    'button-dxfexport',
    'Esporta DXF',
    'glyphicon-white glyphicon-export',
    function () {
        if (sidebarPanel.handleEvent || typeof (sidebarPanel.handleEvent) === 'undefined') {
            var ctrlDXFExport = this.map.getControlsBy('gc_id', 'control-dxfexport')[0];

            if (ctrlDXFExport.active) {
                ctrlDXFExport.deactivate();
                this.deactivate();
                sidebarPanel.hide('dxfexportpanel');
            }
            else {
                ctrlDXFExport.activate();
                this.activate();
                var panelPath = GisClientMap.rootPath + 'plugins/gisclient-maps_dxfexport/panels/';
                if ($.mobile) {
                    panelPath += 'dxf_export_panel_mobile.html?1';
                }
                else {
                    panelPath += 'dxf_export_panel.html?1';
                }
                if ($.trim($('#dxfexportpanel').html()) == '') {
                    $("#dxfexportpanel").load(panelPath, function () {
                        ctrlDXFExport.events.triggerEvent('panelready');
                    });
                }
                else {
                    //this.drawPrintArea();
                }

                sidebarPanel.show('dxfexportpanel');
            }
            if (typeof (sidebarPanel.handleEvent) !== 'undefined')
                sidebarPanel.handleEvent = false;
        }
    },
    { button_group: 'print', sidebar_panel: 'dxfexportpanel', gc_control: 'control-dxfexport' }
);
