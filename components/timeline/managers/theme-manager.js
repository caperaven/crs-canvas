export class ThemeManager {
    static async initialize(canvas) {
        canvas.__layers[0].clearColor = await this.get_variable_color("--timeline-bg") || BABYLON.Color3.FromHexString("#ffffff");
        canvas._theme = {
            header_bg:  await this.get_variable_color("--timeline-header-bg") || "#FFFFFF",
            secondary_header_bg:  await this.get_variable_color("--timeline-header-bg") || "#F4F4F4",
            header_offset_bg:  await this.get_variable_color("--timeline-header-bg") || "#EEEEEE",
            header_border:  await this.get_variable_color("--timeline-header-bg") || "#DBDBDB",
            offset_row_bg:  await this.get_variable_color("--timeline-offset_row_bg") || "#F9F9F9",
            row_range1:  await this.get_variable_color("--timeline-offset_row_bg") || "#C8E5E1",
            row_range2:  await this.get_variable_color("--timeline-offset_row_bg") || "#16A085",
            row_range3:  await this.get_variable_color("--timeline-offset_row_bg") || "#757575",
            row_range4:  await this.get_variable_color("--timeline-offset_row_bg") || "#FF0000"
        }
    }

    static async get_variable_color() {

    }
}