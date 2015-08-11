#!/usr/bin/python
import sys, getopt, json

def main(argv):
    input_file = ''
    output_file = ''
    # dataset = list()

	#Get command line args
    try:
        opts, args = getopt.getopt(argv,"h:i:o:",["input_file=", "output_file="])
    except getopt.GetoptError:
        print 'process.py -i <input_file> -o <output_file>'
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print 'process.py -i <input_file> -o <output_file>'
            sys.exit()
        elif opt in ("-i", "--input_file"):
            input_file = arg
        elif opt in ("-o", "--output_file"):
            output_file = arg

    try:
        with open(input_file, 'r') as f:
            dataset = json.load(f)
    except:
        print 'error loading file {0}'.format(input_file)
        print 'process.py -i <input_file> -o <output_file>'
        sys.exit(2)

    sequence = ["none", "FreezeTrajectory", "FreezeAroundCursor", "FreezeWholeScreen"]
    visual_cue = ["none", "ghost", "trail"]
    speed_density = ["low_low", "low_high", "high_low", "high_high"]
    nums = ["0", "1", "2", "3", "4"]

    newdata = dict()

    #  + seq + '_' + vis + '_' + sd + '_' + num
    # print len(dataset)
    newdata["workerId"] = dataset[0]['workerId']
    for seq in sequence:
        for vis in visual_cue:
            if vis != "none":
                break
            for sd in speed_density:
                total_red_dots_clicked = []
                total_red_dots_gone_offscreen = []
                total_wrong_thing_clicked = []
                total_nothing_clicked = []
                total_trial_time = []
                total_times_hit_shift_key = []
                total_times_hit_c_key = []
                total_blue_dot_answer_distances = []

                rates_clicked_red_dots = []
                rates_clicked_anything = []
                rates_freezed = []
                rates_cleared = []
                for num in nums:
                    id_string = '_' + seq + '_' + vis + '_' + sd + '_' + num
                    total_red_dots_clicked.append(int(dataset[0]['dots_clicked' + id_string]))
                    total_red_dots_gone_offscreen.append(int(dataset[0]['dots_missed' + id_string]))
                    total_wrong_thing_clicked.append(int(dataset[0]['errors' + id_string]))
                    total_nothing_clicked.append(int(dataset[0]['errors_clicked_nothing' + id_string]))
                    total_trial_time.append(float(dataset[0]['time' + id_string]))
                    total_times_hit_shift_key.append(int(dataset[0]['freezes_usesd' + id_string]))
                    total_times_hit_c_key.append(int(dataset[0]['clears_usesd' + id_string]))
                    total_blue_dot_answer_distances.append(abs(int(dataset[0]['distractors_answer' + id_string]) - int(dataset[0]['num_distractors' + id_string])))

                    rates_clicked_red_dots.append(int(dataset[0]['dots_clicked' + id_string]) / (float(dataset[0]['time' + id_string])/1000) )
                    rates_clicked_anything.append( (int(dataset[0]['dots_clicked' + id_string]) + int(dataset[0]['errors_clicked_nothing' + id_string]) + int(dataset[0]['errors' + id_string]) ) / (float(dataset[0]['time' + id_string])/1000) )
                    rates_freezed.append(int(dataset[0]['freezes_usesd' + id_string]) / (float(dataset[0]['time' + id_string])/1000) )
                    rates_cleared.append(int(dataset[0]['clears_usesd' + id_string]) / (float(dataset[0]['time' + id_string])/1000) )

                total_blue_dot_answer_distances.remove(max(total_blue_dot_answer_distances))
                total_blue_dot_answer_distances.remove(min(total_blue_dot_answer_distances))

                avg_red_dots_clicked = sum(total_red_dots_clicked) / len(total_red_dots_clicked)
                avg_red_dots_gone_offscreen = sum(total_red_dots_gone_offscreen) / len(total_red_dots_gone_offscreen)
                avg_wrong_thing_clicked = sum(total_wrong_thing_clicked) / len(total_wrong_thing_clicked)
                avg_nothing_clicked = sum(total_nothing_clicked) / len(total_nothing_clicked)
                avg_trial_time = sum(total_trial_time) / len(total_trial_time)
                avg_times_hit_shift_key = sum(total_times_hit_shift_key) / len(total_times_hit_shift_key)
                avg_times_hit_c_key = sum(total_times_hit_c_key) / len(total_times_hit_c_key)
                avg_blue_dot_answer_distances = sum(total_blue_dot_answer_distances) / len(total_blue_dot_answer_distances)

                avg_rate_clicked_red_dots = sum(rates_clicked_red_dots) / len(rates_clicked_red_dots)
                avg_rate_clicked_anything = sum(rates_clicked_anything) / len(rates_clicked_anything)
                avg_rate_freeze_used = sum(rates_freezed) / len(rates_freezed)
                avg_rate_clear_used = sum(rates_cleared) / len(rates_cleared)

                id_string = '_' + seq + '_' + vis + '_' + sd
                newdata["avg_red_dots_clicked" + id_string] = avg_red_dots_clicked
                newdata["avg_red_dots_gone_offscreen" + id_string] = avg_red_dots_gone_offscreen
                newdata["avg_wrong_thing_clicked" + id_string] = avg_wrong_thing_clicked
                newdata["avg_nothing_clicked" + id_string] = avg_nothing_clicked
                newdata["avg_trial_time" + id_string] = avg_trial_time
                newdata["avg_times_hit_shift_key" + id_string] = avg_times_hit_shift_key
                newdata["avg_times_hit_c_key" + id_string] = avg_times_hit_c_key
                newdata["avg_blue_dot_answer_distances" + id_string] = avg_blue_dot_answer_distances

                newdata["avg_rate_clicked_red_dots" + id_string] = avg_rate_clicked_red_dots
                newdata["avg_rate_clicked_anything" + id_string] = avg_rate_clicked_anything
                newdata["avg_rate_freeze_used" + id_string] = avg_rate_freeze_used
                newdata["avg_rate_clear_used" + id_string] = avg_rate_clear_used

    try:
        with open(output_file, 'w') as f:
                json.dump([newdata], f, indent=4, sort_keys=True)
    except:
        print 'error creating file {0}'.format(output_file)
        print 'process.py -i <input_file> -o <output_file>'
        sys.exit(2)

if __name__ == "__main__":
   main(sys.argv[1:])
